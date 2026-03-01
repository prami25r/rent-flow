import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'default' | 'outline' | 'secondary';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const sizes = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-4 text-sm';
  const variants =
    variant === 'outline'
      ? 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'
      : variant === 'secondary'
      ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
      : 'bg-neutral-900 text-white hover:bg-neutral-800';
  return <button ref={ref} className={twMerge(base, sizes, variants, className)} {...props} />;
});
