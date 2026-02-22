import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { landlordId: string };
    }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.substring('Bearer '.length);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.user = { landlordId: decoded.sub };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

