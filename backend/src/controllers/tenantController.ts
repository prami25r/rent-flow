import { Request, Response } from 'express';
import { TenantCreateSchema } from '../validators/tenant';
import { tenantService } from '../services/tenantService';

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

