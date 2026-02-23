'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard/tenants', label: 'Tenants' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/workflows', label: 'Workflows' },
  { href: '/dashboard/config/late-fee', label: 'Late Fee' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r bg-white">
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold">RentFollow</span>
      </div>
      <nav className="p-2 space-y-1">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm hover:bg-neutral-100',
              pathname.startsWith(i.href) ? 'bg-neutral-100 font-medium' : 'text-neutral-700'
            )}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
