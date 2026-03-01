import { Request, Response } from 'express';
import { RegisterSchema, LoginSchema, VerifyEmailSchema, RequestPasswordResetSchema, ResetPasswordSchema } from '../validators/auth';
import { authService } from '../services/authService';
import { env } from '../config/env';

export const register = async (req: Request, res: Response) => {
  const input = RegisterSchema.parse(req.body);
  const result = await authService.register(input.email, input.name, input.password);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body);
  const result = await authService.login(input.email, input.password);
  if (result.refresh) {
    const secure = env.NODE_ENV === 'production';
    res.cookie('rf_refresh', result.refresh, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400000,
    });
  }
  res.json({ landlord: result.landlord, token: result.token });
};

export const refresh = async (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|; )rf_refresh=([^;]+)/);
  const refreshCookie = (match && decodeURIComponent(match[1])) || req.body?.refresh;
  if (!refreshCookie) return res.status(401).json({ error: 'Missing refresh token' });
  const out = await authService.refresh(refreshCookie);
  res.json(out);
};

export const logout = async (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|; )rf_refresh=([^;]+)/);
  const refreshCookie = (match && decodeURIComponent(match[1])) || req.body?.refresh;
  await authService.logout(refreshCookie, req.user?.landlordId);
  res.clearCookie('rf_refresh', { path: '/api/v1/auth' });
  res.json({ success: true });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const input = VerifyEmailSchema.parse(req.body);
  const out = await authService.verifyEmail(input.email, input.token);
  res.json(out);
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const input = RequestPasswordResetSchema.parse(req.body);
  const out = await authService.requestPasswordReset(input.email);
  res.json(out);
};

export const resetPassword = async (req: Request, res: Response) => {
  const input = ResetPasswordSchema.parse(req.body);
  const out = await authService.resetPassword(input.email, input.token, input.newPassword);
  res.json(out);
};
