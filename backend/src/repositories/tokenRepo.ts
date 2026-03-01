import { prisma } from '../db/prisma';

export const emailTokenRepo = {
  create: (landlordId: string, tokenHash: string, expiresAt: Date) =>
    (prisma as any).emailVerificationToken.create({ data: { landlordId, tokenHash, expiresAt } }),
  findValidByLandlord: (landlordId: string) =>
    (prisma as any).emailVerificationToken.findFirst({
      where: { landlordId, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' },
    }),
  deleteAllForLandlord: (landlordId: string) =>
    (prisma as any).emailVerificationToken.deleteMany({ where: { landlordId } }),
};

export const passwordResetRepo = {
  create: (landlordId: string, tokenHash: string, expiresAt: Date) =>
    (prisma as any).passwordResetToken.create({ data: { landlordId, tokenHash, expiresAt } }),
  findValid: (landlordId: string) =>
    (prisma as any).passwordResetToken.findFirst({
      where: { landlordId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' },
    }),
  markUsed: (id: string) =>
    (prisma as any).passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } }),
  deleteAllForLandlord: (landlordId: string) =>
    (prisma as any).passwordResetToken.deleteMany({ where: { landlordId } }),
};

export const refreshTokenRepo = {
  create: (landlordId: string, tokenHash: string, expiresAt: Date) =>
    (prisma as any).refreshToken.create({ data: { landlordId, tokenHash, expiresAt } }),
  findValidByHash: (tokenHash: string) =>
    (prisma as any).refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    }),
  revoke: (id: string) =>
    (prisma as any).refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),
  deleteAllForLandlord: (landlordId: string) =>
    (prisma as any).refreshToken.deleteMany({ where: { landlordId } }),
};
