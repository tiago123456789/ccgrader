export interface ImageJob {
  id: string;
  url: string;
  changesToApply: ChangeToApply[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  finalUrl: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  currentStep: number;
  totalSteps: number;
}

export interface ChangeToApply {
  action: 'grayscale' | 'resize' | 'watermark';
  fileOutput: string;
  width?: number;
  height?: number;
  watermarkText?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface JobStatus {
  status: ImageJob['status'];
  label: string;
  color: string;
  bgColor: string;
}

export const JOB_STATUSES: Record<ImageJob['status'], JobStatus> = {
  pending: {
    status: 'pending',
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  processing: {
    status: 'processing',
    label: 'Processing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  failed: {
    status: 'failed',
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
};

export const CHANGE_ACTION_LABELS: Record<ChangeToApply['action'], string> = {
  grayscale: 'Grayscale',
  resize: 'Resize',
  watermark: 'Watermark'
};