import { prisma } from '../db/prisma';
import { Prisma, PaymentStatus } from '@prisma/client';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
export const paymentRepo = {


  create: (
    landlordId: string,
    tenantId: string,
    data: Omit<Prisma.PaymentCreateInput, 'landlord' | 'tenant'>
  ) =>
    prisma.payment.create({
      data: {
        ...data,
        landlord: { connect: { id: landlordId } },
        tenant: { connect: { id: tenantId } },
      },
    }),


  listByTenant: (
    landlordId: string,
    tenantId: string,
    skip = 0,
    take = DEFAULT_PAGE_SIZE
  ) => {
    const safeTake =
      take <= 0
        ? DEFAULT_PAGE_SIZE
        : take > MAX_PAGE_SIZE
        ? MAX_PAGE_SIZE
        : take;

    const safeSkip = skip < 0 ? 0 : skip;

    return prisma.payment.findMany({
      where: { landlordId, tenantId },
      skip: safeSkip,
      take: safeTake,
      orderBy: { dueDate: 'desc' },
    });
  },



  countByTenant: (landlordId: string, tenantId: string) =>
    prisma.payment.count({
      where: { landlordId, tenantId },
    }),



  getOverdue: (landlordId: string, today: Date) =>
    prisma.payment.findMany({
      where: {
        landlordId,
        status: {
          in: [
            PaymentStatus.PENDING,
            PaymentStatus.PARTIAL,
          ],
        },
        dueDate: { lt: today },
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            riskLevel: true,
          },
        },
      },
    }),


  applyLateFeeAndEscalate: (
    paymentId: string,
    fee: Prisma.Decimal
  ) =>
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        lateFeesTotal: { increment: fee },
      },
    }),



  markPaid: (
    paymentId: string,
    paidDate: Date,
    amountPaid: Prisma.Decimal
  ) =>
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        paidDate,
        amountPaid,
      },
    }),
};
