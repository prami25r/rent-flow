import { Request, Response } from 'express';
import { landlordRepo } from '../repositories/landlordRepo';

export const getProfile = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const landlord = await landlordRepo.getById(landlordId);
  res.json(landlord ? { id: landlord.id, email: landlord.email, name: landlord.name } : null);
};

export const updateProfile = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const name = String(req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const updated = await landlordRepo.updateName(landlordId, name);
  res.json({ id: updated.id, email: updated.email, name: updated.name });
};
