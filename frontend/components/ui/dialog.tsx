import * as Radix from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

export const Dialog = Radix.Root;
export const DialogTrigger = Radix.Trigger;

export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <Radix.Portal>
      <Radix.Overlay className="fixed inset-0 bg-black/30" />
      <Radix.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-4 shadow-lg focus:outline-none">
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-2">{children}</div>;
}
export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
export function DialogDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-neutral-600">{children}</p>;
}
