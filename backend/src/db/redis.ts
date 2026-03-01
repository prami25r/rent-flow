import Redis from 'ioredis';
import { env } from '../config/env';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

export async function incrWithExpire(key: string, ttlSeconds: number) {
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, ttlSeconds);
  const res = await pipeline.exec();
  const incrRes = res?.[0]?.[1];
  return typeof incrRes === 'number' ? incrRes : 0;
}
