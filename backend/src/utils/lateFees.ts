import { Prisma } from '@prisma/client';


export type LateFeeConfigLike = {
  type: 'FLAT' | 'PERCENTAGE';
  amount: Prisma.Decimal | number | string;
  gracePeriodDays: number;
};

export const calculateLateFee = (
  cfg: LateFeeConfigLike,
  baseAmount: Prisma.Decimal | number | string
): Prisma.Decimal => {
  const base = new Prisma.Decimal(baseAmount as any);
  const amount = new Prisma.Decimal(cfg.amount as any);
  if (cfg.type === 'FLAT') return amount;
  return base.mul(amount).div(100);
};
