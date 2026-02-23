'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Tenant, EscalationWorkflow, Paginated, Payment } from '@/types/api';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TenantDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: tenants } = useQuery({
    queryKey: ['tenants', 'all'],
    queryFn: async () => {
      const res = await api.get<{ items: Tenant[] }>('/tenants', { params: { page: 1, pageSize: 100 } });
      return res.data.items;
    },
  });
  const tenant = tenants?.find((t) => t.id === id) ?? null;

  const { data: workflow } = useQuery({
    queryKey: ['workflow', 'active'],
    queryFn: async () => {
      const res = await api.get<EscalationWorkflow | null>('/workflows/active');
      return res.data;
    },
  });

  const { data: payments } = useQuery({
    queryKey: ['tenant', id, 'payments'],
    queryFn: async () => {
      const res = await api.get<Paginated<Payment>>(`/tenants/${id}/payments`, { params: { page: 1, pageSize: 20 } });
      return res.data;
    },
    enabled: !!id,
  });

  if (!tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Tenant</div>
          <div className="text-lg font-medium">{tenant.firstName} {tenant.lastName}</div>
          <div className="mt-2 text-sm">{tenant.unit}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Risk</div>
          <Badge className="mt-2">{tenant.riskLevel}</Badge>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Late count</div>
          <div className="text-lg font-medium">{tenant.lateCount}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Escalation timeline</div>
        <div className="space-y-2">
          {workflow?.steps?.map((s) => (
            <div key={s.dayOffset} className="flex items-center justify-between border rounded p-2">
              <div className="text-sm">
                Day {s.dayOffset}: {s.action}
              </div>
              <div className="text-xs text-neutral-600">
                {s.applyFee
                  ? s.feeAmount
                    ? `Apply $${s.feeAmount} fee`
                    : s.feePercent
                    ? `Apply ${s.feePercent}% fee`
                    : 'Apply fee'
                  : 'No fee'}
              </div>
            </div>
          )) ?? <div className="text-sm text-neutral-600">No active workflow</div>}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Payment history</div>
        <div className="space-y-2">
          {payments?.items?.map((p) => (
            <div key={p.id} className="grid grid-cols-5 gap-2 text-sm border rounded p-2">
              <div>{new Date(p.dueDate).toLocaleDateString()}</div>
              <div>{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '-'}</div>
              <div>${Number(p.amountDue).toFixed(2)}</div>
              <div className="text-neutral-700">{p.status}</div>
              <div className="text-neutral-700">Fees: ${Number(p.lateFeesTotal).toFixed(2)}</div>
            </div>
          )) ?? <div className="text-sm text-neutral-600">No payments</div>}
        </div>
      </Card>
    </div>
  );
}
