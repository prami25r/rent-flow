'use client';
import { ReactNode } from 'react';
import { useAuthStore } from './store';

export function RoleGuard({ role, children }: { role: 'owner' | 'assistant'; children: ReactNode }) {
  const current = useAuthStore((s) => s.role);
  if (current !== role) {
    return <div className="text-sm text-neutral-700">Insufficient permissions</div>;
  }
  return <>{children}</>;
}
