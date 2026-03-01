import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={twMerge('w-full caption-bottom text-sm', className)} {...props} />;
}
export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={twMerge('[&_tr]:border-b', className)} {...props} />;
}
export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={twMerge('[&_tr:last-child]:border-0', className)} {...props} />;
}
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={twMerge('border-b transition-colors hover:bg-neutral-50', className)} {...props} />;
}
export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={twMerge('h-10 px-2 text-left align-middle font-medium text-neutral-600', className)} {...props} />;
}
export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={twMerge('p-2 align-middle', className)} {...props} />;
}
