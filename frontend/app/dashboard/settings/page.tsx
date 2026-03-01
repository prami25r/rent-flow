'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Landlord, LateFeeConfig } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';

export default function SettingsPage() {
  const qc = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const { data: profile } = useQuery({
    queryKey: ['landlord', 'profile'],
    queryFn: async () => (await api.get<Landlord>('/landlord/profile')).data,
  });
  const updateProfile = useMutation({
    mutationFn: async (name: string) => (await api.put<Landlord>('/landlord/profile', { name })).data,
    onSuccess: (landlord) => {
      qc.setQueryData(['landlord', 'profile'], landlord);
      if (token) setAuth(landlord, token);
    },
  });
  const { data: lateFee } = useQuery({
    queryKey: ['config', 'late-fee'],
    queryFn: async () => (await api.get<LateFeeConfig | null>('/config/late-fee')).data ?? { type: 'FLAT', amount: 0, gracePeriodDays: 0 },
  });
  const updateLateFee = useMutation({
    mutationFn: async (input: LateFeeConfig) => (await api.put<LateFeeConfig>('/config/late-fee', input)).data,
    onSuccess: (cfg) => qc.setQueryData(['config', 'late-fee'], cfg),
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3 max-w-xl">
        <div className="text-sm font-medium">Profile</div>
        <label className="text-sm">Email</label>
        <Input value={profile?.email ?? ''} disabled />
        <label className="text-sm">Name</label>
        <div className="flex gap-2">
          <Input defaultValue={profile?.name ?? ''} id="name-input" />
          <Button onClick={() => {
            const el = document.getElementById('name-input') as HTMLInputElement | null;
            if (el) updateProfile.mutate(el.value);
          }}>Save</Button>
        </div>
      </Card>

      <Card className="p-4 space-y-3 max-w-xl">
        <div className="text-sm font-medium">Late Fee Configuration</div>
        <label className="text-sm">Type</label>
        <select className="h-9 border rounded px-2" value={lateFee?.type ?? 'FLAT'} onChange={(e) => updateLateFee.mutate({ ...(lateFee ?? { type: 'FLAT', amount: 0, gracePeriodDays: 0 }), type: e.target.value as LateFeeConfig['type'] })}>
          <option value="FLAT">Flat</option>
          <option value="PERCENTAGE">Percentage</option>
        </select>
        <label className="text-sm">Amount</label>
        <Input
          type="number"
          value={lateFee?.amount ?? 0}
          onChange={(e) => {
            const newCfg: LateFeeConfig = {
              type: (lateFee?.type ?? 'FLAT') as LateFeeConfig['type'],
              amount: Number(e.target.value),
              gracePeriodDays: lateFee?.gracePeriodDays ?? 0,
            };
            updateLateFee.mutate(newCfg);
          }}
        />
        <label className="text-sm">Grace period (days)</label>
        <Input
          type="number"
          value={lateFee?.gracePeriodDays ?? 0}
          onChange={(e) => {
            const newCfg: LateFeeConfig = {
              type: (lateFee?.type ?? 'FLAT') as LateFeeConfig['type'],
              amount: lateFee?.amount ?? 0,
              gracePeriodDays: Number(e.target.value),
            };
            updateLateFee.mutate(newCfg);
          }}
        />
      </Card>
    </div>
  );
}
