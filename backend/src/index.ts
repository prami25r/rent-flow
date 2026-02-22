import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startDailyWorker } from './jobs/queue';

const port = Number(env.PORT);

startDailyWorker();

app.listen(port, () => {
  logger.info({ port }, 'RentFollow API listening');
});

