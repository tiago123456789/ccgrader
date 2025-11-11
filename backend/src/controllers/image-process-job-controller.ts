import { NextFunction, Request, Response } from 'express';
import { ImageProcessService } from '../services/image-process-service';
import { createJobSchema } from '../validations/job-validation';
import { ValidationError } from 'yup';

export class ImageProcessJobController {
    private imageProcessService: ImageProcessService;

    constructor(service: ImageProcessService) {
        this.imageProcessService = service;
        this.createImageProcessJob = this.createImageProcessJob.bind(this)
        this.findById = this.findById.bind(this)
        this.getAll = this.getAll.bind(this)
        this.getSignedUrlToDownloadFile = this.getSignedUrlToDownloadFile.bind(this)
    }

    async createImageProcessJob(
        req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await createJobSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            await this.imageProcessService.createImageJob(req.body);

            res.sendStatus(202)
        } catch (error) {
            if (error instanceof ValidationError) {
                const errors = error.inner.map(err => err.message);
                res.status(400).json({
                    error: errors
                });
                return;
            }

            return next(error)
        }
    }

    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId } = req.params;
            const job = await this.imageProcessService.getJob(jobId!);
            res.json(job);
        } catch (error) {
            return next(error)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const lastJobId = req.query.lastJobId || null;
            const jobs = await this.imageProcessService.getAllJobs(lastJobId as (string | null));
            res.json({
                data: jobs,
                lastJobId: (jobs[jobs.length - 1])?.id || null
            });
        } catch (error) {
            return next(error)
        }
    }

    async getSignedUrlToDownloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { jobId } = req.params;
            const signedUrl = await this.imageProcessService.getSignedUrlToDownloadFile(jobId!);
            res.json({ url: signedUrl });
        } catch (error) {
            return next(error)
        }
    }

}

export default ImageProcessJobController;