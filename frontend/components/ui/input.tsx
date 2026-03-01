import { forwardRef, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={twMerge(
        'h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-400',
        className
      )}
      {...props}
    />
  );
});
