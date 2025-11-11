import { db } from "@/services/firebase";
import type { ImageJob } from "@/types/job";
import type NewJob from "@/types/new-job";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

interface PaginatedJobs {
    data: ImageJob[];
    lastJobId: string | null;
}

export default function useJobs() {
    const [jobs, setJobs] = useState<PaginatedJobs>({data: [], lastJobId: null});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapAlreadyExists: { [key: string]: boolean } = {}

    const loadJobs = async (lastJobId: string | null) => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/jobs`
            if (lastJobId) {
                url += `?lastJobId=${lastJobId}`
            }
            setIsLoading(true);
            const response = await fetch(url);
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    }

    const createJob = async (job: NewJob) => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(job),
            });

            if (response.status >= 400) {
                const data = await response.json();
                throw new Error(data.error);
            }

        } catch (error) {
            console.log('passsed on here error')
            const message = error instanceof Error ? error.message : 'Failed to create job';
            setError(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const downloadFinalImage = async (jobId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/signed-url`);
            const data = await response.json();
            const aElement = document.createElement('a');
            aElement.href = data.url;
            aElement.target = '_blank';
            aElement.download = 'final-image.jpg';
            document.body.appendChild(aElement);
            aElement.click();
            document.body.removeChild(aElement);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to download final image');
        } finally {
            setIsLoading(false);
        }
    }

    const monitorAddJob = (change: any) => {
        const data = change.doc.data()
        mapAlreadyExists[change.doc.id] = true
        const updatedAt = data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null;
        const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : null;
        const completedAt = data.completedAt ? new Date(data.completedAt.seconds * 1000) : null;

        const newItem = {
            id: change.doc.id,
            url: data.url,
            changesToApply: data.changesToApply,
            completedAt: completedAt,
            createdAt: createdAt,
            finalUrl: data.finalUrl,
            status: data.status,
            updatedAt: updatedAt,
            totalSteps: data.totalSteps,
            currentStep: data.currentStep
        }

        // @ts-ignore
        setJobs((prevJobs) => ({ data: [newItem, ...prevJobs.data], lastJobId: change.doc.id }));
    }

    const monitorUpdateJob = (change: any) => {
        const data = change.doc.data()
        // @ts-ignore
        setJobs((prevJobs) => {
            return {lastJobId: prevJobs.lastJobId, data: [...prevJobs.data].map(item => {
                if (item.id === change.doc.id) {
                    const updatedAt = data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null;
                    const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : null;
                    const completedAt = data.completedAt ? new Date(data.completedAt.seconds * 1000) : null;

                    return {
                        id: change.doc.id,
                        url: data.url,
                        changesToApply: data.changesToApply,
                        completedAt: completedAt,
                        createdAt: createdAt,
                        finalUrl: data.finalUrl,
                        status: data.status,
                        updatedAt: updatedAt,
                        totalSteps: data.totalSteps,
                        currentStep: data.currentStep
                    }
                }

                return item
            })}
        })
    }


    const monitorJobs = async () => {
        const queryRegisters = query(collection(db, 'image-process-jobs'), orderBy('createdAt', 'desc'), limit(1));
        return onSnapshot(queryRegisters, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && !mapAlreadyExists[change.doc.id]) {
                    monitorAddJob(change)
                } else if (change.type === "modified") {
                    monitorUpdateJob(change)
                }
            })
        });
    }

    useEffect(() => {
        monitorJobs();

    }, []);

    return {
        jobs,
        isLoading,
        error,
        loadJobs,
        createJob,
        downloadFinalImage
    }
}
