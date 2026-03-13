import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .default('6379')
    .transform((v) => Number(v))
    .refine((n) => !Number.isNaN(n) && n > 0),
  REDIS_PASSWORD: z.string().optional().nullable(),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('60000')
    .transform((v) => Number(v)),
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform((v) => Number(v)),
  ACCESS_TOKEN_TTL_MINUTES: z
    .string()
    .default('15')
    .transform((v) => Number(v)),
  REFRESH_TOKEN_TTL_DAYS: z
    .string()
    .default('7')
    .transform((v) => Number(v)),
  EMAIL_TOKEN_TTL_HOURS: z
    .string()
    .default('24')
    .transform((v) => Number(v)),
  RESET_TOKEN_TTL_HOURS: z
    .string()
    .default('1')
    .transform((v) => Number(v)),
  LOGIN_LOCKOUT_THRESHOLD: z.string().default('5').transform((v) => Number(v)),
  LOGIN_LOCKOUT_TTL_MINUTES: z.string().default('15').transform((v) => Number(v)),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  console.error('Invalid environment configuration.');
  console.error(fieldErrors);
  console.error('Create backend/.env from backend/.env.example and set required values (JWT_SECRET, DATABASE_URL).');
  process.exit(1);
}

export const env = parsed.data;
