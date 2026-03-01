import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('rounded-lg border bg-white shadow-sm', className)} {...props} />;
}
