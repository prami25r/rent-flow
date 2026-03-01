'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import type { LateFeeConfig, EscalationWorkflow, Tenant } from '@/types/api';
import { useAuthStore } from '@/features/auth/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const { data: lateFee } = useQuery<LateFeeConfig>({
    queryKey: ['config', 'late-fee'],
    queryFn: async () => (await api.get<LateFeeConfig | null>('/config/late-fee')).data ?? { type: 'FLAT', amount: 0, gracePeriodDays: 0 },
  });
  const [fee, setFee] = useState<LateFeeConfig>({ type: 'FLAT', amount: 50, gracePeriodDays: 3 });
  if (lateFee && fee !== lateFee) {
    // lightweight sync to server config if present
    setFee(lateFee);
  }
  const [wfName, setWfName] = useState('Standard Escalation');
  const [steps, setSteps] = useState([{ dayOffset: 3, action: 'Friendly reminder', applyFee: false }]);
  const [tenant, setTenant] = useState<{ firstName: string; lastName: string; unit: string; email?: string }>({ firstName: '', lastName: '', unit: '' });

  const saveFee = useMutation({
    mutationFn: async () => (await api.put<LateFeeConfig>('/config/late-fee', fee)).data,
  });
  const saveWorkflow = useMutation({
    mutationFn: async () => (await api.post<EscalationWorkflow>('/workflows', { name: wfName, isActive: true, steps })).data,
  });
  const addTenant = useMutation({
    mutationFn: async () => (await api.post<Tenant>('/tenants', { ...tenant, monthlyRent: 1000, unit: tenant.unit })).data,
  });

  async function complete() {
    try {
      await saveFee.mutateAsync();
      await saveWorkflow.mutateAsync();
      if (tenant.firstName && tenant.lastName && tenant.unit) {
        await addTenant.mutateAsync();
      }
      setOnboarded();
      router.replace('/dashboard');
    } catch {
      alert('Failed to complete onboarding');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Welcome to RentFollow</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <h2 className="font-medium">Configure late fee</h2>
            <label className="text-sm">Type</label>
            <select className="h-9 border rounded px-2" value={fee.type} onChange={(e) => setFee({ ...fee, type: e.target.value as LateFeeConfig['type'] })}>
              <option value="FLAT">Flat</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
            <label className="text-sm">Amount</label>
            <Input type="number" value={fee.amount} onChange={(e) => setFee({ ...fee, amount: Number(e.target.value) })} />
            <label className="text-sm">Grace period (days)</label>
            <Input type="number" value={fee.gracePeriodDays} onChange={(e) => setFee({ ...fee, gracePeriodDays: Number(e.target.value) })} />
          </Card>

          <Card className="p-4 space-y-2">
            <h2 className="font-medium">Create workflow</h2>
            <label className="text-sm">Name</label>
            <Input value={wfName} onChange={(e) => setWfName(e.target.value)} />
            <div className="text-sm text-neutral-600">First step</div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={steps[0].dayOffset} onChange={(e) => setSteps([{ ...steps[0], dayOffset: Number(e.target.value) }])} />
              <select className="h-9 border rounded px-2" value={steps[0].action} onChange={(e) => setSteps([{ ...steps[0], action: e.target.value }])}>
                <option>Friendly reminder</option>
                <option>Firm notice</option>
                <option>Final warning</option>
              </select>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <h2 className="font-medium">Add first tenant (optional)</h2>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="First name" value={tenant.firstName} onChange={(e) => setTenant({ ...tenant, firstName: e.target.value })} />
              <Input placeholder="Last name" value={tenant.lastName} onChange={(e) => setTenant({ ...tenant, lastName: e.target.value })} />
            </div>
            <Input placeholder="Unit" value={tenant.unit} onChange={(e) => setTenant({ ...tenant, unit: e.target.value })} />
            <Input placeholder="Email (optional)" value={tenant.email ?? ''} onChange={(e) => setTenant({ ...tenant, email: e.target.value })} />
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={complete}>Finish setup</Button>
        </div>
      </div>
    </div>
  );
}
