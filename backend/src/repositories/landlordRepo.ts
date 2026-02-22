import { prisma } from '../db/prisma';

export const landlordRepo = {
  findByEmail: (email: string) => prisma.landlord.findUnique({ where: { email } }),
  create: (data: { email: string; name: string; passwordHash: string }) =>
    prisma.landlord.create({ data }),
  getLateFeeConfig: (landlordId: string) =>
    prisma.lateFeeConfig.findUnique({ where: { landlordId } }),
  upsertLateFeeConfig: (landlordId: string, data: { type: 'FLAT' | 'PERCENTAGE'; amount: any; gracePeriodDays: number }) =>
    prisma.lateFeeConfig.upsert({
      where: { landlordId },
      update: data,
      create: { landlordId, ...data },
    }),
};

