'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { EscalationWorkflow, EscalationStep } from '@/types/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RoleGuard } from '@/features/auth/role-guard';

const TONES = ['Friendly reminder', 'Firm notice', 'Final warning'] as const;

export default function WorkflowBuilderPage() {
  const qc = useQueryClient();
  const { data: active } = useQuery({
    queryKey: ['workflow', 'active'],
    queryFn: async () => {
      const res = await api.get<EscalationWorkflow | null>('/workflows/active');
      return res.data;
    },
  });
  const [name, setName] = useState(active?.name ?? 'Standard Escalation');
  const [steps, setSteps] = useState<EscalationStep[]>(
    active?.steps ?? [{ dayOffset: 3, action: TONES[0], applyFee: false }]
  );

  const mutation = useMutation({
    mutationFn: async (input: { name: string; isActive: boolean; steps: EscalationStep[] }) => {
      const res = await api.post<EscalationWorkflow>('/workflows', input);
      return res.data;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['workflow', 'active'] });
      const prev = qc.getQueryData<EscalationWorkflow | null>(['workflow', 'active']);
      qc.setQueryData(['workflow', 'active'], { id: 'optimistic', createdAt: '', updatedAt: '', isActive: true, name: input.name, steps: input.steps });
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(['workflow', 'active'], ctx.prev);
      alert('Failed to save workflow');
    },
    onSuccess: (data) => {
      qc.setQueryData(['workflow', 'active'], data);
    },
  });

  function addStep() {
    setSteps((s) => [...s, { dayOffset: (s.at(-1)?.dayOffset ?? 0) + 3, action: TONES[0], applyFee: false }]);
  }

  return (
    <RoleGuard role="owner">
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Workflow name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
        </div>
        <div className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-center">
              <div>
                <label className="text-xs">Day offset</label>
                <Input
                  type="number"
                  value={s.dayOffset}
                  onChange={(e) => updateStep(idx, { dayOffset: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs">Tone preset</label>
                <select
                  className="w-full border rounded h-9 px-2"
                  value={s.action}
                  onChange={(e) => updateStep(idx, { action: e.target.value })}
                >
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs">Apply fee</label>
                <input
                  type="checkbox"
                  checked={s.applyFee}
                  onChange={(e) => updateStep(idx, { applyFee: e.target.checked })}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Fee amount"
                  value={s.feeAmount ?? ''}
                  onChange={(e) => updateStep(idx, { feeAmount: e.target.value ? Number(e.target.value) : undefined, feePercent: undefined })}
                  disabled={!s.applyFee}
                />
                <Input
                  type="number"
                  placeholder="Fee %"
                  value={s.feePercent ?? ''}
                  onChange={(e) => updateStep(idx, { feePercent: e.target.value ? Number(e.target.value) : undefined, feeAmount: undefined })}
                  disabled={!s.applyFee}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addStep}>Add step</Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => mutation.mutate({ name, isActive: true, steps })}>Save workflow</Button>
        </div>
      </Card>
    </div>
    </RoleGuard>
  );

  function updateStep(idx: number, patch: Partial<EscalationStep>) {
    setSteps((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
}
