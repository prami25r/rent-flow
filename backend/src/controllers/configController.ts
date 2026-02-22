import { Request, Response } from 'express';
import { configService } from '../services/configService';
import { LateFeeConfigSchema } from '../validators/config';

export const getLateFee = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const cfg = await configService.getLateFee(landlordId);
  res.json(cfg);
};

export const setLateFee = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const input = LateFeeConfigSchema.parse(req.body);
  const cfg = await configService.setLateFee(landlordId, input);
  res.json(cfg);
};

