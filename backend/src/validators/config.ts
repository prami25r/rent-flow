import { z } from 'zod';

export const LateFeeConfigSchema = z.object({
  type: z.enum(['FLAT', 'PERCENTAGE']),
  amount: z.number().positive(),
  gracePeriodDays: z.number().int().nonnegative().default(0),
});

