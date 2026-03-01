import { prisma } from '../db/prisma';
import { PaymentStatus } from '@prisma/client';

export const analyticsService = {
  summary: async (landlordId: string) => {
    const today = new Date();

    const [latePayments, totalFees, riskDist, totalPayments, recoveredCount, totalTenants] =
      await Promise.all([
        prisma.payment.findMany({
          where: {
            landlordId,
            status: {
              in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
            },
          },
          select: {
            dueDate: true,
            paidDate: true,
          },
        }),
        prisma.payment.aggregate({
          where: { landlordId },
          _sum: { lateFeesTotal: true },
        }),
        prisma.tenant.groupBy({
          by: ['riskLevel'],
          where: { landlordId },
          _count: { _all: true },
        }),
        prisma.payment.count({ where: { landlordId } }),
        prisma.payment.count({
          where: { landlordId, status: PaymentStatus.PAID },
        }),
        prisma.tenant.count({ where: { landlordId } }),
      ]);

    const daysLateArr = latePayments.map(({ dueDate, paidDate }) => {
      const end = paidDate ?? today;
      const diff = end.getTime() - dueDate.getTime();
      return diff > 0 ? Math.floor(diff / 86400000) : 0;
    });

    const avgDaysLate =
      daysLateArr.length > 0
        ? daysLateArr.reduce((a, b) => a + b, 0) / daysLateArr.length
        : 0;

    const totalLateFees = totalFees._sum.lateFeesTotal ?? 0;

    const recoveryRate =
      totalPayments > 0 ? recoveredCount / totalPayments : 0;

    const risk: Record<string, number> = riskDist.reduce(
      (acc, r) => {
        acc[r.riskLevel as string] = r._count._all;
        return acc;
      },
      {} as Record<string, number>
    );

    const overdueCount = latePayments.length;
    const overdueSamples = await prisma.payment.findMany({
      where: {
        landlordId,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
        dueDate: { lt: today },
      },
      orderBy: { dueDate: 'desc' },
      take: 10,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, unit: true } },
      },
    });

    return {
      avgDaysLate,
      recoveryRate,
      totalLateFees,
      risk,
      totalTenants,
      overdueCount,
      overdueSamples,
    };
  },
};
