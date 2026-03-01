'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { EscalationWorkflow, EscalationStep } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function WorkflowDetailPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const { data: wf } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => (await api.get<EscalationWorkflow | null>(`/workflows/${id}`)).data,
  });
  const mutation = useMutation({
    mutationFn: async (input: { name: string; isActive: boolean; steps: EscalationStep[] }) => (await api.post<EscalationWorkflow>('/workflows', input)).data,
    onSuccess: (data) => {
      qc.setQueryData(['workflow', 'active'], data);
    },
  });
  if (!wf) return <div>Loading...</div>;
  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Workflow name</label>
          <Input defaultValue={wf.name} />
        </div>
        <div className="space-y-3">
          {wf.steps.map((s, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-center">
              <div>
                <label className="text-xs">Day offset</label>
                <Input type="number" defaultValue={s.dayOffset} />
              </div>
              <div className="col-span-2">
                <label className="text-xs">Tone preset</label>
                <select className="w-full border rounded h-9 px-2" defaultValue={s.action}>
                  <option>Friendly reminder</option>
                  <option>Firm notice</option>
                  <option>Final warning</option>
                </select>
              </div>
              <div>
                <label className="text-xs">Apply fee</label>
                <input type="checkbox" defaultChecked={s.applyFee} />
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Fee amount" defaultValue={s.feeAmount ?? ''} disabled={!s.applyFee} />
                <Input type="number" placeholder="Fee %" defaultValue={s.feePercent ?? ''} disabled={!s.applyFee} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => mutation.mutate({ name: wf.name, isActive: true, steps: wf.steps })}>Save as new</Button>
        </div>
      </Card>
    </div>
  );
}
