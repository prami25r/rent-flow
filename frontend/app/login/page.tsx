'use client';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/axios';
import type { AuthResponse } from '@/types/api';
import { useAuthStore } from '@/features/auth/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard/tenants';

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const res = await api.post<AuthResponse>('/auth/login', values);
      setAuth(res.data.landlord, res.data.token);
      router.replace(hasOnboarded ? next : '/onboarding');
    } catch (e: unknown) {
      let msg = 'Login failed';
      if (typeof e === 'string') msg = e;
      else if (e && typeof e === 'object' && 'message' in e) msg = String((e as { message?: string }).message);
      alert(msg);
    }
  }

  return (
    <Suspense fallback={<div />}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-semibold mb-4">Sign in</h1>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
            <p className="text-sm text-neutral-600">
              New to RentFollow? <a href="/register" className="underline">Create an account</a>
            </p>
          </form>
        </div>
      </div>
    </Suspense>
  );
}
