import { logger } from './logger';

export async function sendEmail(to: string, subject: string, text: string) {
  logger.info({ to, subject, text }, 'Send email');
}
