import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  newPassword: z.string().min(8),
});
