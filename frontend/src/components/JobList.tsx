import type { ImageJob } from '../types/job';
import { JOB_STATUSES } from '../types/job';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { NotFound } from './not-found';
import { Loading } from './loading';
import dayjs from 'dayjs';
import { Popover, PopoverTrigger } from './ui/popover';
import { PopoverContent } from '@radix-ui/react-popover';
import { Alert, AlertDescription } from './ui/alert';

interface JobListProps {
  jobs: ImageJob[];
  isLoading?: boolean;
  downloadFinalImage?: (jobId: string) => void;
}

export function JobList({ jobs, isLoading, downloadFinalImage }: JobListProps) {

  const getStatusBadgeVariant = (status: ImageJob['status']): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Loading />
  }


  if (jobs.length === 0) {
    return <NotFound />
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Job ID</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Original Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Final Image</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const statusInfo = JOB_STATUSES[job.status];

            return (
              <TableRow key={job.id} className="hover:bg-slate-50/50">
                <TableCell className="font-mono text-sm text-slate-600">
                  {job.id}
                </TableCell>
                <TableCell>
                  {Math.round((job.currentStep / job.totalSteps) * 100)}%
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(job.currentStep / job.totalSteps) * 100}%` }}>
                    </div>
                  </div>

                </TableCell>

                <TableCell>
                  <Button variant="default">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      Original image
                    </a>
                  </Button>
                </TableCell>

                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        variant={getStatusBadgeVariant(job.status)}
                        className="capitalize"
                      >
                        {statusInfo.label}
                      </Badge>
                    </PopoverTrigger>
                    {job.status == "failed" && (
                      <PopoverContent>
                        <Alert className="bg-red-500 text-white">
                          <AlertDescription>
                            {job?.errorMessage}
                          </AlertDescription>
                        </Alert>
                      </PopoverContent>
                    )}
                  </Popover>
                </TableCell>

                <TableCell>
                  {job.status === 'completed' && job.finalUrl ? (
                    // @ts-ignore
                    <Button className="cursor-pointer" onClick={() => downloadFinalImage(job.id)} variant="default">
                      Download final image
                    </Button>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-slate-600">
                  {dayjs(job.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>

                <TableCell className="text-sm text-slate-600">
                  {job.status === 'completed' ? dayjs(job.completedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </TableCell>

                <TableCell>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}