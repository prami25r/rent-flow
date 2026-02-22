import { z } from 'zod';

export const TenantCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  unit: z.string().min(1),
  monthlyRent: z.number().positive(),
});

