import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { landlordRepo } from '../repositories/landlordRepo';
import { env } from '../config/env';
import { scheduleDailyJob } from '../jobs/queue';
import { emailTokenRepo, passwordResetRepo, refreshTokenRepo } from '../repositories/tokenRepo';
import { generateToken, hashToken, timingSafeEqual } from '../utils/crypto';
import { sendEmail } from '../utils/mailer';
import { redis, incrWithExpire } from '../db/redis';
import { prisma } from '../db/prisma';

export const authService = {
  register: async (email: string, name: string, password: string) => {
    const existing = await landlordRepo.findByEmail(email);
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const landlord = await landlordRepo.create({ email, name, passwordHash });
    const token = jwt.sign({ sub: landlord.id }, env.JWT_SECRET, { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` });
    const emailToken = generateToken(32);
    await emailTokenRepo.deleteAllForLandlord(landlord.id);
    await emailTokenRepo.create(landlord.id, hashToken(emailToken), new Date(Date.now() + env.EMAIL_TOKEN_TTL_HOURS * 3600000));
    await sendEmail(email, 'Verify your RentFollow account', `Your verification code: ${emailToken}`);
    await scheduleDailyJob(landlord.id).catch(() => {});
    return { landlord: { id: landlord.id, email: landlord.email, name: landlord.name }, token };
    },
  login: async (email: string, password: string) => {
    const key = `lockout:${email}`;
    try {
      const fails = await redis.get(key);
      if (fails && Number(fails) >= env.LOGIN_LOCKOUT_THRESHOLD) {
        throw Object.assign(new Error('Account temporarily locked. Try again later.'), { status: 429 });
      }
    } catch {
      // Redis not available: skip lockout check
    }
    const landlord = await landlordRepo.findByEmail(email);
    if (!landlord) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const ok = await bcrypt.compare(password, landlord.passwordHash);
    if (!ok) {
      try {
        const count = await incrWithExpire(key, env.LOGIN_LOCKOUT_TTL_MINUTES * 60);
        throw Object.assign(new Error('Invalid credentials'), { status: 401, meta: { attempts: count } });
      } catch {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
      }
    }
    const verified = (landlord as any).emailVerified ?? true;
    if (!verified && env.NODE_ENV === 'production') {
      throw Object.assign(new Error('Email not verified'), { status: 403 });
    }
    const token = jwt.sign({ sub: landlord.id }, env.JWT_SECRET, { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` });
    const refresh = generateToken(32);
    const refreshHash = hashToken(refresh);
    await refreshTokenRepo.create(landlord.id, refreshHash, new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000));
    return { landlord: { id: landlord.id, email: landlord.email, name: landlord.name }, token, refresh };
  },
  refresh: async (refreshToken: string) => {
    const hash = hashToken(refreshToken);
    const record = await refreshTokenRepo.findValidByHash(hash);
    if (!record) throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    const access = jwt.sign({ sub: record.landlordId }, env.JWT_SECRET, { expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m` });
    return { token: access };
  },
  logout: async (refreshToken?: string, landlordId?: string) => {
    if (refreshToken) {
      const hash = hashToken(refreshToken);
      const record = await refreshTokenRepo.findValidByHash(hash);
      if (record) await refreshTokenRepo.revoke(record.id);
    }
    if (landlordId) {
      await refreshTokenRepo.deleteAllForLandlord(landlordId);
    }
    return { success: true };
  },
  verifyEmail: async (email: string, token: string) => {
    const landlord = await landlordRepo.findByEmail(email);
    if (!landlord) throw Object.assign(new Error('Invalid verification request'), { status: 400 });
    const current = await emailTokenRepo.findValidByLandlord(landlord.id);
    if (!current) throw Object.assign(new Error('Verification token expired'), { status: 400 });
    if (!timingSafeEqual(current.tokenHash, hashToken(token))) throw Object.assign(new Error('Invalid token'), { status: 400 });
    await emailTokenRepo.deleteAllForLandlord(landlord.id);
    await (prisma as any).landlord.update({ where: { id: landlord.id }, data: { emailVerified: true } });
    return { verified: true };
  },
  requestPasswordReset: async (email: string) => {
    const landlord = await landlordRepo.findByEmail(email);
    if (!landlord) return { sent: true }; // do not reveal existence
    const token = generateToken(32);
    await passwordResetRepo.deleteAllForLandlord(landlord.id);
    await passwordResetRepo.create(landlord.id, hashToken(token), new Date(Date.now() + env.RESET_TOKEN_TTL_HOURS * 3600000));
    await sendEmail(email, 'Reset your RentFollow password', `Your reset code: ${token}`);
    return { sent: true };
  },
  resetPassword: async (email: string, token: string, newPassword: string) => {
    const landlord = await landlordRepo.findByEmail(email);
    if (!landlord) throw Object.assign(new Error('Invalid reset request'), { status: 400 });
    const rec = await passwordResetRepo.findValid(landlord.id);
    if (!rec) throw Object.assign(new Error('Reset token expired'), { status: 400 });
    if (!timingSafeEqual(rec.tokenHash, hashToken(token))) throw Object.assign(new Error('Invalid token'), { status: 400 });
    await passwordResetRepo.markUsed(rec.id);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.landlord.update({ where: { id: landlord.id }, data: { passwordHash } });
    await refreshTokenRepo.deleteAllForLandlord(landlord.id);
    return { success: true };
  },
};
