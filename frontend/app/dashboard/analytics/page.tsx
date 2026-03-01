'use client';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { AnalyticsSummary, RiskLevel } from '@/types/api';
import { Card } from '@/components/ui/card';

const Bar = dynamic(async () => (await import('react-chartjs-2')).Bar, { ssr: false });

export default function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const res = await api.get<AnalyticsSummary>('/analytics/summary');
      return res.data;
    },
  });

  const riskLabels: RiskLevel[] = ['SAFE', 'LOW', 'MEDIUM', 'HIGH'];
  const riskData = riskLabels.map((r) => (data?.risk?.[r] ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Avg days late" value={(data?.avgDaysLate ?? 0).toFixed(1)} />
        <StatCard title="Recovery rate" value={`${Math.round((data?.recoveryRate ?? 0) * 100)}%`} />
        <StatCard title="Total late fees" value={`$${(data?.totalLateFees ?? 0).toFixed(2)}`} />
        <StatCard title="Tenants" value={riskData.reduce((a, b) => a + b, 0)} />
      </div>
      <Card className="p-4">
        <div className="text-sm font-medium mb-4">Tenant risk distribution</div>
        <div className="max-w-xl">
          <Bar
            data={{
              labels: riskLabels,
              datasets: [
                {
                  label: 'Tenants',
                  data: riskData,
                  backgroundColor: ['#22c55e', '#65a30d', '#f59e0b', '#ef4444'],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </Card>
  );
}
