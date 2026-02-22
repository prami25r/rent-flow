import { prisma } from '../db/prisma';
import { Prisma, RiskLevel } from '@prisma/client';

const MAX_PAGE_SIZE = 100;

export const tenantRepo = {
  create: (
    landlordId: string,
    data: Omit<Prisma.TenantCreateInput, 'landlord' | 'payments'>
  ) =>
    prisma.tenant.create({
      data: {
        ...data,
        landlord: { connect: { id: landlordId } },
      },
    }),

  list: (landlordId: string, skip = 0, take = 20) => {
    const safeTake = take > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : take;

    return prisma.tenant.findMany({
      where: { landlordId },
      skip,
      take: safeTake,
      orderBy: { createdAt: 'desc' },
    });
  },

  count: (landlordId: string) =>
    prisma.tenant.count({
      where: { landlordId },
    }),

  updateRisk: (
    tenantId: string,
    riskLevel: RiskLevel,
    lateCount: number
  ) =>
    prisma.tenant.update({
      where: { id: tenantId },
      data: {
        riskLevel,
        lateCount,
      },
    }),
};
