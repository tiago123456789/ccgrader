import { useState } from 'react';
import type { ImageJob } from '../types/job';
import { JobList } from '../components/JobList';
import { CreateJobModal } from '../components/CreateJobModal';
import { Button } from '../components/ui/button';
import type EffectData from '@/types/effect-data';
import { LuPlus, LuRefreshCw } from "react-icons/lu";
import useJobs from '@/hooks/useJobs';

interface JobsPageProps {
  jobs: ImageJob[];
  lastJobId: string | null;
  isLoading: boolean;
  nextPage: (lastJobId: string | null) => void;
  onBack?: () => void;
}

const MAX_JOBS_PER_PAGE = 10;

export function JobsPage({ jobs, lastJobId, isLoading, nextPage, onBack }: JobsPageProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const { createJob, downloadFinalImage, error } = useJobs();

  const handleCreateJob = async (data: { imageUrl: string, effects: EffectData[] }) => {
    await createJob({
      url: data.imageUrl,
      changesToApply: data.effects
    });
    setIsCreateDrawerOpen(false);
  };

  const hasShowMoreButton = () => {
    return lastJobId != null && jobs.length == MAX_JOBS_PER_PAGE
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="mb-4"
              >
                ← Back to Home
              </Button>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Image Process Jobs
            </h1>
            <p className="text-gray-600">
              Monitor and manage your image processing jobs
            </p>
          </div>
          <div className="flex space-x-3">
          <Button
              onClick={() => nextPage(null)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <LuRefreshCw className="w-4 h-4 cursor-pointer" />
            </Button>
            <Button
              onClick={() => setIsCreateDrawerOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <LuPlus className="w-4 h-4 cursor-pointer" />&nbsp;
              Create New Job
            </Button>
          </div>
        </div>


        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl shadow-slate-200/50 p-8">
          <JobList
            jobs={jobs} isLoading={isLoading}
            downloadFinalImage={downloadFinalImage}
          />

          {hasShowMoreButton() && (
            <Button
              onClick={() => nextPage(lastJobId)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Load more jobs
            </Button>
          )}
          {!hasShowMoreButton() && (
            <Button
              onClick={() => nextPage(null)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Back to first page
            </Button>
          )}
        </div>
      </div>

      <CreateJobModal
        open={isCreateDrawerOpen}
        onOpenChange={setIsCreateDrawerOpen}
        onSubmit={handleCreateJob}
        error={error}
      />
    </div>
  );
}