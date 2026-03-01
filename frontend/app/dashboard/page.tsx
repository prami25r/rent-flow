'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { AnalyticsSummary } from '@/types/api';
import { Card } from '@/components/ui/card';

export default function DashboardOverviewPage() {
  const { data } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => (await api.get<AnalyticsSummary>('/analytics/summary')).data,
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-6">
        <Stat title="Total tenants" value={data?.totalTenants ?? 0} />
        <Stat title="Overdue" value={data?.overdueCount ?? 0} />
        <Stat title="High-risk" value={data?.risk?.HIGH ?? 0} />
        <Stat title="Late fees collected" value={`$${(data?.totalLateFees ?? 0).toFixed(2)}`} />
        <Stat title="Avg days late" value={(data?.avgDaysLate ?? 0).toFixed(1)} />
      </div>
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Recent escalations (overdue)</div>
        <div className="space-y-2">
          {data?.overdueSamples?.map((p) => (
            <div key={p.id} className="grid grid-cols-5 gap-2 text-sm border rounded p-2">
              <div>{p.tenant.firstName} {p.tenant.lastName}</div>
              <div>{p.tenant.unit}</div>
              <div>{new Date(p.dueDate).toLocaleDateString()}</div>
              <div>${Number(p.amountDue).toFixed(2)}</div>
              <div className="text-neutral-700">{p.status}</div>
            </div>
          )) ?? <div className="text-sm text-neutral-600">No recent overdue</div>}
        </div>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </Card>
  );
}
