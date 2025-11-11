import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { IMAGE_PROCESS_JOB_QUEUE } from '../constants/queue';
import { Queue } from 'bullmq';
import { getRedisClient } from './redis';
import { QUEUE_OPTIONS } from '../constants/queue';

export function getBullBoard() {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/queue-board");

  const redisClient = getRedisClient();
  const queueOptions = {
    connection: redisClient,
    defaultJobOptions: QUEUE_OPTIONS,
  };

  const queue = new Queue(IMAGE_PROCESS_JOB_QUEUE, queueOptions);

  createBullBoard({
    queues: [
      new BullMQAdapter(queue),
    ],
    serverAdapter
  });

  return serverAdapter;
}