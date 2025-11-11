
export type CreateJobRequest = {
    url: string;
    totalSteps?: number;
    currentStep?: number;
    changesToApply: Array<{
      action: 'resize' | 'grayscale' | 'watermark';
      width?: number | undefined;
      height?: number | undefined;
    }>;
};