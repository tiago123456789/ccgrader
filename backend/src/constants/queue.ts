
export const IMAGE_PROCESS_JOB_QUEUE = "image-process-job";

export const QUEUE_OPTIONS = {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000,
    },
};