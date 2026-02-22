import { landlordRepo } from '../repositories/landlordRepo';

export const configService = {
  getLateFee: (landlordId: string) => landlordRepo.getLateFeeConfig(landlordId),
  setLateFee: (landlordId: string, data: { type: 'FLAT' | 'PERCENTAGE'; amount: number; gracePeriodDays: number }) =>
    landlordRepo.upsertLateFeeConfig(landlordId, data),
};

