'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { LateFeeConfig } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/features/auth/role-guard';

export default function LateFeeConfigPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['config', 'late-fee'],
    queryFn: async () => {
      const res = await api.get<LateFeeConfig | null>('/config/late-fee');
      return res.data ?? { type: 'FLAT', amount: 0, gracePeriodDays: 0 };
    },
  });
  const mutation = useMutation({
    mutationFn: async (input: LateFeeConfig) => {
      const res = await api.put<LateFeeConfig>('/config/late-fee', input);
      return res.data;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['config', 'late-fee'] });
      const prev = qc.getQueryData<LateFeeConfig>(['config', 'late-fee']);
      qc.setQueryData(['config', 'late-fee'], input);
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(['config', 'late-fee'], ctx.prev);
      alert('Failed to update config');
    },
    onSuccess: (data) => {
      qc.setQueryData(['config', 'late-fee'], data);
    },
  });

  function update<K extends keyof LateFeeConfig>(key: K, value: LateFeeConfig[K]) {
    const next = { ...(data ?? { type: 'FLAT', amount: 0, gracePeriodDays: 0 }), [key]: value };
    mutation.mutate(next);
  }

  return (
    <RoleGuard role="owner">
      <Card className="p-4 space-y-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Type</label>
            <select
              value={data?.type ?? 'FLAT'}
              onChange={(e) => update('type', e.target.value as LateFeeConfig['type'])}
              className="w-full border rounded h-9 px-2"
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Amount</label>
            <Input
              type="number"
              value={data?.amount ?? 0}
              onChange={(e) => update('amount', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm">Grace period (days)</label>
            <Input
              type="number"
              value={data?.gracePeriodDays ?? 0}
              onChange={(e) => update('gracePeriodDays', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => mutation.mutate(data!)}>Save</Button>
        </div>
      </Card>
    </RoleGuard>
  );
}
