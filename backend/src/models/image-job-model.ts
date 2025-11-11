import { JobStatus } from "../types/job-status.type";

export interface ImageJobModel {
    id?: string;
    url: string;
    changesToApply: Array<{
        action: 'resize' | 'grayscale' | 'watermark';
    }>;
    status: JobStatus;
    finalUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    errorMessage?: string;
    totalSteps: number;
    currentStep: number;
}