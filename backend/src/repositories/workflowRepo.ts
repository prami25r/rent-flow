import { prisma } from '../db/prisma';

export const workflowRepo = {
  getActiveWithSteps: (landlordId: string) =>
    prisma.escalationWorkflow.findFirst({
      where: { landlordId, isActive: true },
      include: { steps: { orderBy: { dayOffset: 'asc' } } },
    }),
};

