'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Paginated, Tenant, RiskLevel } from '@/types/api';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';

const RISK_ORDER: RiskLevel[] = ['SAFE', 'LOW', 'MEDIUM', 'HIGH'];

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const { data, isLoading } = useQuery({
    queryKey: ['tenants', page],
    queryFn: async () => {
      const res = await api.get<Paginated<Tenant>>('/tenants', { params: { page, pageSize: 20 } });
      return res.data;
    },
    keepPreviousData: true,
  });

  const items = useMemo(() => {
    const src = data?.items ?? [];
    if (filter === 'ALL') return src;
    return src.filter((t) => t.riskLevel === filter);
  }, [data, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['ALL', ...RISK_ORDER] as const).map((r) => (
            <Button
              key={r}
              variant={filter === r ? 'default' : 'outline'}
              onClick={() => setFilter(r)}
            >
              {r}
            </Button>
          ))}
        </div>
        <div className="text-sm text-neutral-600">
          Total: {data?.total ?? 0}
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable<Tenant>
          columns={[
            { key: 'firstName', header: 'Tenant', render: (_v, row) => `${row.firstName} ${row.lastName}` },
            { key: 'unit', header: 'Unit' },
            { key: 'monthlyRent', header: 'Rent', render: (v) => `$${Number(v as number).toFixed(2)}` },
            {
              key: 'riskLevel',
              header: 'Risk',
              render: (v) => (
                <Badge variant="secondary" className={riskClass(v)}>
                  {v as RiskLevel}
                </Badge>
              ),
            },
            { key: 'lateCount', header: 'Late' },
            {
              key: 'id',
              header: '',
              render: (_v, row) => (
                <Link className="text-blue-600 underline" href={`/dashboard/tenants/${row.id}`}>View</Link>
              ),
            },
          ]}
          data={items}
        />
      )}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button variant="outline" disabled={(data?.page ?? 1) * (data?.pageSize ?? 20) >= (data?.total ?? 0)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}

function riskClass(r: RiskLevel) {
  switch (r) {
    case 'SAFE':
      return 'bg-green-100 text-green-800';
    case 'LOW':
      return 'bg-emerald-100 text-emerald-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HIGH':
      return 'bg-red-100 text-red-800';
  }
}
