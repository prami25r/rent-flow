import { tenantRepo } from '../repositories/tenantRepo';
import { getPagination } from '../utils/pagination';

export const tenantService = {
  create: (landlordId: string, input: { firstName: string; lastName: string; email?: string; phone?: string; unit: string; monthlyRent: any }) =>
    tenantRepo.create(landlordId, input as any),
  list: async (landlordId: string, q: { page?: number; pageSize?: number }) => {
    const { skip, take, page, pageSize } = getPagination(q);
    const [items, total] = await Promise.all([tenantRepo.list(landlordId, skip, take), tenantRepo.count(landlordId)]);
    return { items, page, pageSize, total };
  },
};

