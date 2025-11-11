import { CreateJobRequest } from "../../../types/create-job-request";

export interface NewJob {
    jobId: string;
    data: CreateJobRequest;
}