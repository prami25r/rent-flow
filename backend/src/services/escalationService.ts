import { paymentRepo } from '../repositories/paymentRepo';
import { landlordRepo } from '../repositories/landlordRepo';
import { prisma } from '../db/prisma';
import { calculateLateFee } from '../utils/lateFees';
import { workflowService } from './workflowService';
import { RiskLevel } from '@prisma/client';

export const escalationService = {
  runDaily: async (landlordId: string, today: Date = new Date()) => {
    const [overdue, feeCfg, workflow] = await Promise.all([
      paymentRepo.getOverdue(landlordId, today),
      landlordRepo.getLateFeeConfig(landlordId),
      workflowService.getActive(landlordId),
    ]);
    const steps = workflow?.steps ?? [];
    for (const p of overdue) {
      const daysLate = Math.max(
        0,
        Math.floor((today.getTime() - p.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const applicableStep = steps
        .filter((s) => s.dayOffset <= daysLate)
        .sort((a, b) => b.dayOffset - a.dayOffset)[0];
      let feeToApply = null as any;
      if (applicableStep?.applyFee) {
        if (applicableStep.feeAmount) feeToApply = applicableStep.feeAmount as any;
        else if (applicableStep.feePercent) feeToApply = calculateLateFee({ type: 'PERCENTAGE', amount: applicableStep.feePercent, gracePeriodDays: 0 }, p.amountDue);
      } else if (feeCfg && daysLate > feeCfg.gracePeriodDays) {
        feeToApply = calculateLateFee(feeCfg as any, p.amountDue);
      }
      await prisma.$transaction(async (tx) => {
        if (feeToApply) {
          await tx.payment.update({ where: { id: p.id }, data: { lateFeesTotal: { increment: feeToApply } } });
          await tx.tenant.update({ where: { id: p.tenantId }, data: { lateCount: { increment: 1 } } });
        }
        const tenant = await tx.tenant.findUnique({ where: { id: p.tenantId } });
        if (tenant) {
          const riskLevel = calculateRisk(tenant.lateCount, daysLate);
          await tx.tenant.update({ where: { id: tenant.id }, data: { riskLevel } });
        }
      });
    }
    return { processed: overdue.length };
  },
};

function calculateRisk(lateCount: number, daysLate: number): RiskLevel {
  const score = lateCount * 2 + Math.floor(daysLate / 7);
  if (score >= 6) return RiskLevel.HIGH;
  if (score >= 3) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}
