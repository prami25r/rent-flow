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
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
