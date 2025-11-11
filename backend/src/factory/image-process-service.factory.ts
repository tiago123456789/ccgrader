import ImageProcessService from "../services/image-process-service";
import ImageProcessJobRepository from "../repositories/image-process-job.repository";
import IQueueAdapter from "../adapters/queue/queue.interface";
import BullMQQueueAdapter from "../adapters/queue/bullmq-queue.adapter";
import ImageProcessJobRepositoryInterface from "../repositories/image-process-job-repository.interface";
import { IModification } from "../adapters/image-modifier/modification/modification.interface";
import GrayscaleModification from "../adapters/image-modifier/modification/grayscale-modification";
import ResizeModification from "../adapters/image-modifier/modification/resize-modification";
import { IMAGE_PROCESS_JOB_QUEUE } from "../constants/queue";
import FirebaseStorageAdapter from "../adapters/storage/firebase-storage.adapter";
import IStorageAdapter from "../adapters/storage/storage.interface";
import WatermarkModification from "../adapters/image-modifier/modification/watermark-modification";

class ImageProcessServiceFactory implements IFactory<ImageProcessService> {
    create(): ImageProcessService {
        const queueAdapter: IQueueAdapter = new BullMQQueueAdapter(
            IMAGE_PROCESS_JOB_QUEUE,
        )
        const imageProcessJobRepository: ImageProcessJobRepositoryInterface = new ImageProcessJobRepository();
        const imageModifier: Array<IModification> = [
            new GrayscaleModification(),
            new ResizeModification(),
            new WatermarkModification()
        ];
        
        const storage: IStorageAdapter = new FirebaseStorageAdapter();
        const imageProcessService = new ImageProcessService(
            queueAdapter, imageProcessJobRepository, 
            imageModifier, storage
        );

        return imageProcessService;
    }
}

export default ImageProcessServiceFactory