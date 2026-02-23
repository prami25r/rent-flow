import { Sidebar } from '@/components/sidebar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">
        <div className="h-14 border-b bg-white flex items-center px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
