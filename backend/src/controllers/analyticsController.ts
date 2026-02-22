import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

export const getSummary = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const data = await analyticsService.summary(landlordId);
  res.json(data);
};

