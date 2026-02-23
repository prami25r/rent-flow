import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Landlord } from '@/types/api';

type Role = 'owner' | 'assistant';

type AuthState = {
  user: Landlord | null;
  token: string | null;
  role: Role;
  setAuth: (user: Landlord, token: string, role?: Role) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: 'owner',
      setAuth: (user, token, role) => {
        set({ user, token, role: role ?? 'owner' });
        if (typeof document !== 'undefined') {
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `rf_token=${encodeURIComponent(token)}; path=/; expires=${expires.toUTCString()}`;
        }
      },
      clear: () => {
        set({ user: null, token: null, role: 'owner' });
        if (typeof document !== 'undefined') {
          document.cookie = 'rf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
    }),
    { name: 'rf-auth' }
  )
);
