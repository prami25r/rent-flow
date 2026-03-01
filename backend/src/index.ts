import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startDailyWorker } from './jobs/queue';

const port = Number(env.PORT);

try {
  startDailyWorker();
} catch (err) {
  logger.warn({ err }, 'Failed to start daily worker, continuing without Redis');
}

app.listen(port, () => {
  logger.info({ port }, 'RentFollow API listening');
});
