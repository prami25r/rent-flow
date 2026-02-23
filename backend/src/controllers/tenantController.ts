import { Request, Response } from 'express';
import { TenantCreateSchema } from '../validators/tenant';
import { tenantService } from '../services/tenantService';
import { getPagination } from '../utils/pagination';
import { paymentRepo } from '../repositories/paymentRepo';

export const createTenant = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const input = TenantCreateSchema.parse(req.body);
  const created = await tenantService.create(landlordId, input);
  res.status(201).json(created);
};

export const listTenants = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
  const result = await tenantService.list(landlordId, { page, pageSize });
  res.json(result);
};

export const listTenantPayments = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const tenantId = req.params.id;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
  const { skip, take, page: p, pageSize: ps } = getPagination({ page, pageSize });
  const [items, total] = await Promise.all([
    paymentRepo.listByTenant(landlordId, tenantId, skip, take),
    paymentRepo.countByTenant(landlordId, tenantId),
  ]);
  res.json({ items, page: p, pageSize: ps, total });
};
