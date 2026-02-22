import { Request, Response } from 'express';
import { RegisterSchema, LoginSchema } from '../validators/auth';
import { authService } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const input = RegisterSchema.parse(req.body);
  const result = await authService.register(input.email, input.name, input.password);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body);
  const result = await authService.login(input.email, input.password);
  res.json(result);
};

