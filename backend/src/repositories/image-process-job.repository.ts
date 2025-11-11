import firestoreDb from '../config/database';
import { Timestamp } from 'firebase-admin/firestore';
import { ImageJobModel } from '../models/image-job-model';
import { JobStatus } from '../types/job-status.type';
import ImageProcessJobRepositoryInterface from './image-process-job-repository.interface';
import { CreateJobRequest } from '../types/create-job-request';

class ImageProcessJobRepository implements ImageProcessJobRepositoryInterface {
    private readonly collectionName = 'image-process-jobs';

    async save(jobData: CreateJobRequest): Promise<string> {
        const jobDocument: ImageJobModel = {
            url: jobData.url,
            changesToApply: jobData.changesToApply,
            status: JobStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalSteps: jobData.totalSteps || 0,
            currentStep: 0
        };

        const docRef = await firestoreDb.collection(this.collectionName).add({
            ...jobDocument,
            createdAt: Timestamp.fromDate(jobDocument.createdAt),
            updatedAt: Timestamp.fromDate(jobDocument.updatedAt)
        });

        return docRef.id;
    }

    async findById(id: string): Promise<ImageJobModel | null> {
        const docRef = firestoreDb.collection(this.collectionName).doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return null;
        }

        const data = docSnapshot.data();
        if (!data) {
            return null;
        }

        const jobDocument: ImageJobModel = {
            id: docSnapshot.id,
            url: data.url,
            changesToApply: data.changesToApply,
            status: data.status,
            finalUrl: data?.finalUrl,
            errorMessage: data?.errorMessage,
            completedAt: data.completedAt?.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            totalSteps: data.totalSteps,
            currentStep: data.currentStep
        };

        if (data.completedAt) {
            jobDocument.completedAt = data.completedAt.toDate();
        }

        if (data.errorMessage) {
            jobDocument.errorMessage = data.errorMessage;
        }

        return jobDocument;
    }

    async update(
        id: string,
        jobData: ImageJobModel
    ): Promise<void> {
        const docRef = firestoreDb.collection(this.collectionName).doc(id);
        const updateData: any = {
            ...jobData,
            updatedAt: Timestamp.fromDate(new Date())
        };

        if (jobData.errorMessage) {
            updateData.errorMessage = jobData.errorMessage;
        }

        if (jobData.completedAt) {
            updateData.completedAt = Timestamp.fromDate(jobData.completedAt);
        }

        await docRef.update(updateData);
    }

    async updateStatus(
        id: string,
        status: JobStatus,
        errorMessage?: string,
        completedAt?: Date
    ): Promise<void> {
        const docRef = firestoreDb.collection(this.collectionName).doc(id);
        const updateData: any = {
            status,
            updatedAt: Timestamp.fromDate(new Date())
        };

        if (errorMessage) {
            updateData.errorMessage = errorMessage;
        }

        if (completedAt) {
            updateData.completedAt = Timestamp.fromDate(completedAt);
        }

        await docRef.update(updateData);
    }

    async findAll(lastJobId?: string | null): Promise<ImageJobModel[]> {
        let snapshot;
        if (lastJobId) {
            const lastDoc = await this.findById(lastJobId);
            snapshot = await firestoreDb.collection(this.collectionName)
                .orderBy('createdAt', 'desc').startAfter(lastDoc?.createdAt).limit(10).get();
        } else {
            snapshot = await firestoreDb.collection(this.collectionName)
                .orderBy('createdAt', 'desc').limit(10).get();
        }
        const jobs: ImageJobModel[] = [];
        snapshot.forEach((doc: any) => {
            const jobDocument: ImageJobModel = {
                id: doc.id,
                url: doc.data().url,
                changesToApply: doc.data().changesToApply,
                status: doc.data().status,
                finalUrl: doc.data().finalUrl,
                errorMessage: doc.data().errorMessage,
                completedAt: doc.data().completedAt?.toDate(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
                totalSteps: doc.data().totalSteps || 0,
                currentStep: doc.data().currentStep || 0
            };
            if (doc.data().completedAt) {
                jobDocument.completedAt = doc.data().completedAt.toDate();
            }
            if (doc.data().errorMessage) {
                jobDocument.errorMessage = doc.data().errorMessage;
            }
            jobs.push(jobDocument);
        });

        return jobs;
    }
}

export default ImageProcessJobRepository;