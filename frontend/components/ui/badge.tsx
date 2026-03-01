import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={twMerge('inline-flex h-6 items-center rounded-full px-2 text-xs font-medium', className)} {...props} />;
}
