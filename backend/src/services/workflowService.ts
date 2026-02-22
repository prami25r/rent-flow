import { prisma } from '../db/prisma';

export const workflowService = {
  create: async (landlordId: string, input: { name: string; isActive: boolean; steps: Array<{ dayOffset: number; action: string; applyFee: boolean; feeAmount?: number; feePercent?: number }> }) => {
    if (input.isActive) {
      await prisma.escalationWorkflow.updateMany({ where: { landlordId }, data: { isActive: false } });
    }
    const wf = await prisma.escalationWorkflow.create({
      data: {
        landlordId,
        name: input.name,
        isActive: input.isActive,
        steps: {
          create: input.steps.map((s) => ({
            dayOffset: s.dayOffset,
            action: s.action,
            applyFee: s.applyFee,
            feeAmount: s.feeAmount,
            feePercent: s.feePercent,
          })),
        },
      },
      include: { steps: true },
    });
    return wf;
  },
  getActive: (landlordId: string) =>
    prisma.escalationWorkflow.findFirst({ where: { landlordId, isActive: true }, include: { steps: { orderBy: { dayOffset: 'asc' } } } }),
};

