import { Request, Response } from 'express';
import { escalationService } from '../services/escalationService';

export const runDailyRecovery = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const result = await escalationService.runDaily(landlordId, new Date());
  res.json(result);
};

