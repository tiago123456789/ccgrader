import { ImageJobModel } from "../models/image-job-model";
import { JobStatus } from "../types/job-status.type";
import { CreateJobRequest } from "../types/create-job-request";

interface ImageProcessJobRepositoryInterface {
    
    save(requestData: CreateJobRequest): Promise<string>;
    findById(jobId: string): Promise<ImageJobModel | null>;
    findAll(lastJobId?: string | null): Promise<ImageJobModel[]>;
    update(jobId: string, jobData: ImageJobModel): Promise<void>;
    updateStatus(jobId: string, status: JobStatus): Promise<void>;
}

export default ImageProcessJobRepositoryInterface;