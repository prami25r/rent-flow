'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 flex items-center justify-between px-6 border-b">
        <div className="font-semibold">RentFollow</div>
        <div className="flex gap-2">
          <Link href="/login"><Button variant="outline">Sign in</Button></Link>
          <Link href="/register"><Button>Get started</Button></Link>
        </div>
      </header>
      <main className="px-6 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold">Operational rent recovery for small landlords</h1>
          <p className="mt-4 text-neutral-700">
            Automate late fee rules, schedule firm-but-fair escalations, and track recovery metrics — all in one clean dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/register"><Button>Create account</Button></Link>
            <Link href="/login"><Button variant="outline">Sign in</Button></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
