import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { landlordRepo } from '../repositories/landlordRepo';
import { env } from '../config/env';
import { scheduleDailyJob } from '../jobs/queue';

export const authService = {
  register: async (email: string, name: string, password: string) => {
    const existing = await landlordRepo.findByEmail(email);
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const landlord = await landlordRepo.create({ email, name, passwordHash });
    const token = jwt.sign({ sub: landlord.id }, env.JWT_SECRET, { expiresIn: '7d' });
    await scheduleDailyJob(landlord.id).catch(() => {});
    return { landlord: { id: landlord.id, email: landlord.email, name: landlord.name }, token };
    },
  login: async (email: string, password: string) => {
    const landlord = await landlordRepo.findByEmail(email);
    if (!landlord) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const ok = await bcrypt.compare(password, landlord.passwordHash);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const token = jwt.sign({ sub: landlord.id }, env.JWT_SECRET, { expiresIn: '7d' });
    return { landlord: { id: landlord.id, email: landlord.email, name: landlord.name }, token };
  },
};
