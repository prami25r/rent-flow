import { z } from 'zod';

export const EscalationStepSchema = z.object({
  dayOffset: z.number().int().nonnegative(),
  action: z.string().min(1),
  applyFee: z.boolean().default(false),
  feeAmount: z.number().positive().optional(),
  feePercent: z.number().positive().max(100).optional(),
});

export const WorkflowCreateSchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  steps: z.array(EscalationStepSchema).min(1),
});

