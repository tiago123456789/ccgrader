import { Queue, Worker } from "bullmq";
import { getRedisClient } from "../../config/redis";
import IMessage from "./message/message.interface";
import IQueueAdapter from "./queue.interface";
import { QUEUE_OPTIONS } from "../../constants/queue";

class BullMQQueueAdapter implements IQueueAdapter {

    private queue: Queue | null = null;

    constructor(private readonly queueName: string) {
        this.init();
    }

    private init() {
        const redisClient = getRedisClient();
        const queueOptions = {
            connection: redisClient,
            defaultJobOptions: QUEUE_OPTIONS,
        };

        this.queue = new Queue(this.queueName, queueOptions);
    }

    async publish(message: IMessage): Promise<void> {
        if (!this.queue) {
            throw new Error('Queue not initialized');
        }
        await this.queue.add(this.queueName, message);
    }

    process(callback: (message: IMessage) => void, concurrency: number): void {
        if (!this.queue) {
            throw new Error('Queue not initialized');
        }

        new Worker(this.queueName, async (job) => {
            await callback(job.data);
        }, {
            connection: getRedisClient(),
            concurrency: concurrency
        });

    }

}

export default BullMQQueueAdapter;