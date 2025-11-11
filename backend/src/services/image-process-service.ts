import { randomUUID } from 'node:crypto';
import { IModification } from '../adapters/image-modifier/modification/modification.interface';
import { NewJob } from '../adapters/queue/message/NewJob';
import IQueueAdapter from '../adapters/queue/queue.interface';
import ImageProcessJobRepositoryInterface from '../repositories/image-process-job-repository.interface';
import NotFoundException from '../exception/notfound.exception';
import InvalidDataException from '../exception/invalid-data.exception';
import fs from 'fs';
import axios from 'axios';
import { JobStatus } from '../types/job-status.type';
import IStorageAdapter from '../adapters/storage/storage.interface';
import { logger } from '../config/logger';
import { CreateJobRequest } from '../types/create-job-request';

const EXPIRATION_TIME_MINUTES = 1;
const TIMEOUT_30SECONDS = 30000;
export class ImageProcessService {

  private mapChanges: Map<string, IModification> = new Map();

  constructor(
    private readonly queueAdapter: IQueueAdapter,
    private readonly imageProcessJobRepository: ImageProcessJobRepositoryInterface,
    private readonly imageModifier: Array<IModification>,
    private readonly storage: IStorageAdapter
  ) {
    this.imageModifier.forEach(modification => {
      this.mapChanges.set(modification.getId(), modification);
    });
  }

  async createImageJob(requestData: CreateJobRequest): Promise<void> {
    if (!requestData.changesToApply || requestData.changesToApply.length === 0) {
      requestData.changesToApply = [];
    }

    const isPngOrJpg = requestData.url.endsWith('.png') ||
      requestData.url.endsWith('.jpg') ||
      requestData.url.endsWith('.jpeg');
    if (!isPngOrJpg) {
      throw new InvalidDataException('File must be a PNG, JPG or JPEG image');
    }

    const fileOutput = `${randomUUID()}${new Date().getTime()}.jpg`;
    for (let index = 0; index < requestData.changesToApply.length; index++) {
      const change = requestData.changesToApply[index];

      const modification = this.mapChanges.get(change!.action);
      if (!modification) {
        throw new NotFoundException(`Type change ${change!.action} not found`);
      }

      modification.isParamsValid({
        fileInput: requestData.url,
        fileOutput: fileOutput,
        ...change
      });

      // @ts-ignore
      requestData.changesToApply[index] = { ...change, fileOutput };
    }

    requestData.totalSteps = 5 + requestData.changesToApply.length;
    requestData.currentStep = 0;

    logger.info(`Creating image process job`);
    const jobId = await this.imageProcessJobRepository.save(requestData);

    logger.info(`Publishing image process job`);
    await this.queueAdapter.publish(
      {
        jobId: jobId,
        data: requestData,
      } as NewJob
    );
  }

  private async downloadFile(url: string, fileOutput: string): Promise<void> {
    const fileWriteStream = fs.createWriteStream(fileOutput)
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      timeout: TIMEOUT_30SECONDS,
    })

    if (response.status !== 200) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    response.data.pipe(fileWriteStream);

    await new Promise((resolve, reject) => {
      fileWriteStream.on('finish', () => {
        resolve({});
      });
      fileWriteStream.on('error', (err) => {
        reject(err);
      });
    });

  }

  async processJob(job: NewJob) {
    let fileOutput: string | null = null;
    try {
      logger.info(`Starting job ${job.jobId}`);
      const { url, changesToApply } = job.data;

      let currentStep = (job.data.currentStep || 0) + 1;

      logger.info(`Creating directory ${job.jobId}`);
      fs.mkdirSync(job.jobId);

      currentStep += 1
      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, { currentStep });

      logger.info(`Updating job status to processing ${job.jobId}`);
      await this.imageProcessJobRepository.updateStatus(job.jobId, JobStatus.PROCESSING);

      const fileExtension = url.split('.').reverse()[0];
      fileOutput = `${job.jobId}/${job.jobId}.${fileExtension}`;
      if (changesToApply && changesToApply.length > 0) {
        // @ts-ignore
        fileOutput = `${job.jobId}/${changesToApply[0].fileOutput}`;
      }

      currentStep += 1
      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, { currentStep });
     
      logger.info(`Downloading file ${url}`);
      await this.downloadFile(url, fileOutput as string);

      logger.info(`Applying changes to file ${fileOutput}`);
      for (let index = 0; index < job.data.changesToApply.length; index++) {
        const change = job.data.changesToApply[index];
        const modification = this.mapChanges.get(change!.action);
        if (!modification) {
          throw new NotFoundException(`Type change ${change!.action} not found`);
        }

        const result = await modification.apply({
          ...change,
          fileInput: fileOutput as string,
          fileOutput: `${job.jobId}/${job.jobId}-${index}.${fileExtension}` as string,
        });

        if (result && result.fileOutput) {
          let hasSettedDirectory = result.fileOutput.startsWith(job.jobId);
          if (!hasSettedDirectory) {
            result.fileOutput = `${job.jobId}/${result.fileOutput}`;
          } else {
            fileOutput = result.fileOutput;
          }
        }

        currentStep += 1
      }

      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, { currentStep });

      logger.info(`Uploading file ${fileOutput}`);

      const fileUrl = await this.storage.uploadFile(fileOutput);

      currentStep += 1

      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, { currentStep });

      logger.info(`Updating job status to completed ${job.jobId}`);

      currentStep += 1

      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, {
        finalUrl: fileUrl,
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        currentStep: currentStep
      });

      logger.info(`Job ${job.jobId} processed successfully`);
    } catch (error: any) {
      logger.error(`Job ${job.jobId} failed with error: ${error?.message}`, error);
      // @ts-ignore
      await this.imageProcessJobRepository.update(job.jobId, {
        status: JobStatus.FAILED,
        errorMessage: error?.message,
        updatedAt: new Date()
      });

      throw error;
    } finally {
      logger.info(`Removing directory ${job.jobId}`);
      fs.rmSync(job.jobId, { recursive: true, force: true });
    }

  }

  async getJob(jobId: string) {
    const job = await this.imageProcessJobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    return job;
  }

  async getAllJobs(lastJobId?: string | null) {
    const jobs = await this.imageProcessJobRepository.findAll(lastJobId);
    return jobs;
  }

  async getSignedUrlToDownloadFile(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    let fileUrl = job.finalUrl;
    let filename = fileUrl?.split('?')[0];
    filename = filename?.split('/').reverse()[0];
    return this.storage.getSignedUrl(
      decodeURIComponent(filename as string), EXPIRATION_TIME_MINUTES
    );
  }
}

export default ImageProcessService;