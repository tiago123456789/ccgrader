import dotenv from "dotenv"
dotenv.config();
import { closeRedisConnection } from '../config/redis';
import BullMQQueueAdapter from '../adapters/queue/bullmq-queue.adapter';
import { IMAGE_PROCESS_JOB_QUEUE } from '../constants/queue';
import { NewJob } from '../adapters/queue/message/NewJob';
import IMessage from '../adapters/queue/message/message.interface';
import ImageProcessServiceFactory from '../factory/image-process-service.factory';

const imageProcessService = new ImageProcessServiceFactory().create();

const queueAdapter = new BullMQQueueAdapter(
  IMAGE_PROCESS_JOB_QUEUE,
)

const CONCURRENCY = 5;

queueAdapter.process(async (message: IMessage) => {
  const data = message as NewJob;
  await imageProcessService.processJob(data);
}, CONCURRENCY)

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeRedisConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeRedisConnection();
  process.exit(0);
});

