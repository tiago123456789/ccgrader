import { JobsPage } from './pages/JobsPage';
import useJobs from './hooks/useJobs';
import { useEffect } from 'react';

function App() {
  const { jobs, isLoading, loadJobs } = useJobs();

  useEffect(() => {
    loadJobs(null);
  }, []);
  
  return (
    <div className="container mx-auto px-4">
      <JobsPage 
      jobs={jobs.data} lastJobId={jobs.lastJobId} 
      isLoading={isLoading} nextPage={loadJobs} />
    </div>
  );
}

export default App;
