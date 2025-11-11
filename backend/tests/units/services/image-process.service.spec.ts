import { IModification } from "../../../src/adapters/image-modifier/modification/modification.interface";
import IQueueAdapter from "../../../src/adapters/queue/queue.interface";
import ImageProcessJobRepositoryInterface from "../../../src/repositories/image-process-job-repository.interface";
import ImageProcessService from "../../../src/services/image-process-service";
import IStorageAdapter from "../../../src/adapters/storage/storage.interface";
import { RESIZE, WATERMARK } from "../../../src/types/change.type";
import ResizeModification from "../../../src/adapters/image-modifier/modification/resize-modification";
import GrayscaleModification from "../../../src/adapters/image-modifier/modification/grayscale-modification";
import WatermarkModification from "../../../src/adapters/image-modifier/modification/watermark-modification";
import fs from 'fs';
import axios from 'axios';
import { JobStatus } from "../../../src/types/job-status.type";
import { NewJob } from "../../../src/adapters/queue/message/NewJob";

jest.mock('fs');
jest.mock('axios');
jest.mock('../../../src/config/logger');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedLogger = require('../../../src/config/logger').logger;

describe("ImageProcessService", () => {
    let queueAdapter: IQueueAdapter;
    let imageProcessJobRepository: ImageProcessJobRepositoryInterface
    let imageModifier: Array<IModification>;
    let storage: IStorageAdapter;
    let mockModification: IModification;


    beforeEach(() => {
        jest.clearAllMocks();

        queueAdapter = {
            publish: jest.fn(),
            process: jest.fn(),
        };
        imageProcessJobRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
        };

        imageModifier = [
            new ResizeModification(),
            new GrayscaleModification(),
            new WatermarkModification()
        ];
        storage = {
            getSignedUrl: jest.fn(),
            uploadFile: jest.fn(),
        };

        mockModification = {
            getId: jest.fn().mockReturnValue('resize'),
            apply: jest.fn(),
            isParamsValid: jest.fn(),
        };
    })

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("Should find an image process job by id", async () => {
        imageProcessJobRepository.findById.mockResolvedValue({
            id: "1",
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        const result = await imageProcessService.getJob("1");
        expect(result.id).toEqual("1");
        expect(result.status).toEqual("pending");
    })

    it("Should throw error when an image process job not found", async () => {
        try {
            imageProcessJobRepository.findById.mockResolvedValue(null);

            const imageProcessService = new ImageProcessService(
                queueAdapter, imageProcessJobRepository,
                imageModifier, storage
            );

            await imageProcessService.getJob("1")
        } catch (error) {
            expect(error.message).toBe("Job 1 not found")
        }
    })


    it("Should return all jobs", async () => {
        imageProcessJobRepository.findAll.mockResolvedValue([
            {
                id: "1",
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: "2",
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ]);

        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        const result = await imageProcessService.getAllJobs();
        expect(result.length).toEqual(2);
    })


    it("Should throw error when try create job, because url is not png or jpeg", async () => {
        try {

            const imageProcessService = new ImageProcessService(
                queueAdapter, imageProcessJobRepository,
                imageModifier, storage
            );

            await imageProcessService.createImageJob({
                url: "https://example.com/image.jpgv2",
                changesToApply: []
            })
        } catch (error) {
            expect(error.message).toBe("File must be a PNG, JPG or JPEG image")
        }
    })


    it("Should throw error when try create job and try resize image, but without width or height", async () => {
        try {


            const imageProcessService = new ImageProcessService(
                queueAdapter, imageProcessJobRepository,
                imageModifier, storage
            );

            await imageProcessService.createImageJob({
                url: "https://example.com/image.jpg",
                changesToApply: [
                    {
                        action: RESIZE
                    }
                ]
            })
        } catch (error) {
            expect(error.message).toBe("resize - You need to provide a width.")
        }
    })


    it("Should throw error when try create job and add watermark, but without position or watermarkFileUrl", async () => {
        try {
            const imageProcessService = new ImageProcessService(
                queueAdapter, imageProcessJobRepository,
                imageModifier, storage
            );

            await imageProcessService.createImageJob({
                url: "https://example.com/image.jpg",
                changesToApply: [
                    {
                        action: WATERMARK
                    }
                ]
            })
        } catch (error) {
            expect(error.message).toBe("watermark - You need to provide a position.")
        }
    })

    it("Should be created a job", async () => {
        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        await imageProcessService.createImageJob({
            url: "https://example.com/image.jpg",
            changesToApply: []
        })

        expect(queueAdapter.publish).toHaveBeenCalledTimes(1);
        expect(imageProcessJobRepository.save).toHaveBeenCalledTimes(1);
    })

    it('Should successfully download and save a file', async () => {
        const url = 'https://example.com/image.jpg';
        const fileOutput = '/tmp/test-image.jpg';

        const mockResponse = {
            status: 200,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);

        const mockWriteStream = {
            on: jest.fn(),
        };
        mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);

        mockWriteStream.on.mockImplementation((event, callback) => {
            if (event === 'finish') {
                callback();
            }
        });

        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        await imageProcessService.downloadFile(url, fileOutput);

        expect(mockedAxios).toHaveBeenCalledWith({
            method: 'get',
            url,
            responseType: 'stream',
        });
        expect(mockedFs.createWriteStream).toHaveBeenCalledWith(fileOutput);
        expect(mockResponse.data.pipe).toHaveBeenCalledWith(mockWriteStream);
    });

    it('Should throw an error when HTTP response status is not 200', async () => {
        const url = 'https://example.com/image.jpg';
        const fileOutput = '/tmp/test-image.jpg';

        const mockResponse = {
            status: 404,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);


        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        await expect(imageProcessService.downloadFile(url, fileOutput))
            .rejects.toThrow(
                'Failed to download file: 404'
            );
    });

    it('Should throw an error when file write stream encounters an error', async () => {
        const url = 'https://example.com/image.jpg';
        const fileOutput = '/tmp/test-image.jpg';
        const mockError = new Error('File write error');

        const mockResponse = {
            status: 200,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);

        const mockWriteStream = {
            on: jest.fn(),
        };
        mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);

        mockWriteStream.on.mockImplementation((event, callback) => {
            if (event === 'error') {
                callback(mockError);
            }
        });

        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository,
            imageModifier, storage
        );

        await expect(imageProcessService.downloadFile(url, fileOutput))
            .rejects.toThrow(mockError);
    });

    it('Should process job successfully with no changes', async () => {
        const job: NewJob = {
            jobId: 'job-123',
            data: {
                url: 'https://example.com/image.jpg',
                changesToApply: []
            }
        };

        mockedFs.mkdirSync.mockImplementation(() => { });
        mockedFs.rmSync.mockImplementation(() => { });

        const mockResponse = {
            status: 200,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);

        const mockWriteStream = {
            on: jest.fn(),
        };
        mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);
        mockWriteStream.on.mockImplementation((event, callback) => {
            if (event === 'finish') {
                callback();
            }
        });

        imageProcessJobRepository.updateStatus.mockResolvedValue();
        storage.uploadFile.mockResolvedValue('https://storage.example.com/processed.jpg');
        imageProcessJobRepository.update.mockResolvedValue();

        const imageProcessService = new ImageProcessService(
            queueAdapter,
            imageProcessJobRepository,
            imageModifier,
            storage
        );

        await imageProcessService.processJob(job);

        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('job-123');
        expect(imageProcessJobRepository.updateStatus).toHaveBeenCalledWith('job-123', JobStatus.PROCESSING);
        expect(storage.uploadFile).toHaveBeenCalledWith('job-123/job-123.jpg');
        expect(mockedFs.rmSync).toHaveBeenCalledWith('job-123', { recursive: true, force: true });
    });

    it('Should process job successfully with changes', async () => {
        const job: NewJob = {
            jobId: 'job-123',
            data: {
                url: 'https://example.com/image.jpg',
                changesToApply: [
                    {
                        action: 'resize',
                        width: 100,
                        height: 100
                    }
                ]
            }
        };

        mockedFs.mkdirSync.mockImplementation(() => { });
        mockedFs.rmSync.mockImplementation(() => { });

        const mockResponse = {
            status: 200,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);

        const mockWriteStream = {
            on: jest.fn(),
        };
        mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);
        mockWriteStream.on.mockImplementation((event, callback) => {
            if (event === 'finish') {
                callback();
            }
        });

        imageProcessJobRepository.updateStatus.mockResolvedValue();
        storage.uploadFile.mockResolvedValue('https://storage.example.com/processed.jpg');
        imageProcessJobRepository.update.mockResolvedValue();

        mockModification.apply.mockResolvedValue({
            fileOutput: 'job-123/job-123-0.jpg'
        });

        imageModifier = [mockModification];

        const imageProcessService = new ImageProcessService(
            queueAdapter,
            imageProcessJobRepository,
            imageModifier,
            storage
        );

        await imageProcessService.processJob(job);

        expect(mockedFs.mkdirSync).toHaveBeenCalledWith('job-123');
        expect(imageProcessJobRepository.updateStatus).toHaveBeenCalledWith('job-123', JobStatus.PROCESSING);
        expect(mockModification.apply).toHaveBeenCalledTimes(1);
        expect(storage.uploadFile).toHaveBeenCalledWith('job-123/job-123-0.jpg');
        expect(mockedFs.rmSync).toHaveBeenCalledWith('job-123', { recursive: true, force: true });
    });

    it('Should handle error during processing and update job status to failed', async () => {
        const job: NewJob = {
            jobId: 'job-123',
            data: {
                url: 'https://example.com/image.jpg',
                changesToApply: []
            }
        };

        const error = new Error('Processing failed');
        mockedFs.mkdirSync.mockImplementation(() => { });
        mockedFs.rmSync.mockImplementation(() => { });
        imageProcessJobRepository.updateStatus.mockRejectedValue(error);
        imageProcessJobRepository.update.mockResolvedValue();

        const imageProcessService = new ImageProcessService(
            queueAdapter,
            imageProcessJobRepository,
            imageModifier,
            storage
        );

        await expect(imageProcessService.processJob(job)).rejects.toThrow('Processing failed');

        expect(imageProcessJobRepository.update).toHaveBeenCalledWith('job-123', {
            status: JobStatus.FAILED,
            errorMessage: 'Processing failed',
            updatedAt: expect.any(Date)
        });
        expect(mockedFs.rmSync).toHaveBeenCalledWith('job-123', { recursive: true, force: true });
    });

    it('Should throw NotFoundException when modification not found', async () => {
        const job: NewJob = {
            jobId: 'job-123',
            data: {
                url: 'https://example.com/image.jpg',
                changesToApply: [
                    {
                        action: 'unknown-action' as any
                    }
                ]
            }
        };

        mockedFs.mkdirSync.mockImplementation(() => { });
        mockedFs.rmSync.mockImplementation(() => { });

        const mockResponse = {
            status: 200,
            data: {
                pipe: jest.fn(),
            },
        };
        mockedAxios.mockResolvedValue(mockResponse);

        const mockWriteStream = {
            on: jest.fn(),
        };
        mockedFs.createWriteStream.mockReturnValue(mockWriteStream as any);
        mockWriteStream.on.mockImplementation((event, callback) => {
            if (event === 'finish') {
                callback();
            }
        });

        imageProcessJobRepository.updateStatus.mockResolvedValue();

        const imageProcessService = new ImageProcessService(
            queueAdapter,
            imageProcessJobRepository,
            imageModifier,
            storage
        );

        await expect(imageProcessService.processJob(job)).rejects.toThrow('Type change unknown-action not found');

        expect(mockedFs.rmSync).toHaveBeenCalledWith('job-123', { recursive: true, force: true });
    });

})