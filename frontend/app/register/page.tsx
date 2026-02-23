'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/axios';
import type { AuthResponse } from '@/types/api';
import { useAuthStore } from '@/features/auth/store';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export default function RegisterPage() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const res = await api.post<AuthResponse>('/auth/register', values);
      setAuth(res.data.landlord, res.data.token);
      router.replace('/dashboard/tenants');
    } catch (e: unknown) {
      let msg = 'Registration failed';
      if (typeof e === 'string') msg = e;
      else if (e && typeof e === 'object' && 'message' in e) msg = String((e as { message?: string }).message);
      alert(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input type="text" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">Create account</Button>
          <p className="text-sm text-neutral-600">
            Already have an account? <a href="/login" className="underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
