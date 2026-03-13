import { Queue, Worker, JobsOptions } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { escalationService } from '../services/escalationService';

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};

export const DAILY_QUEUE = 'daily-overdue-scan';

export const dailyQueue = new Queue<{ landlordId: string }, any, string>(DAILY_QUEUE, { connection });

export function startDailyWorker() {
  try {
    const worker = new Worker<{ landlordId: string }, any, string>(
      DAILY_QUEUE,
      async (job) => {
        logger.info({ jobId: job.id, landlordId: job.data.landlordId }, 'Running daily overdue scan');
        await escalationService.runDaily(job.data.landlordId, new Date());
      },
      { connection }
    );
    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, 'Daily overdue scan failed');
    });
    worker.once('error', async (err) => {
      logger.warn({ err }, 'Redis unavailable, disabling daily worker');
      try {
        await worker.close();
      } catch (closeErr) {
        logger.error({ err: closeErr }, 'Failed to close daily worker after Redis error');
      }
    });
  } catch (err) {
    logger.warn({ err }, 'Redis not available, skipping daily worker');
  }
}

export async function scheduleDailyJob(landlordId: string) {
  const opts: JobsOptions = {
    repeat: { pattern: '0 2 * * *' }, // every day at 02:00
    jobId: `daily:${landlordId}`,
    removeOnComplete: true,
    removeOnFail: false,
  };
  await dailyQueue.add('scan', { landlordId }, opts);
}
