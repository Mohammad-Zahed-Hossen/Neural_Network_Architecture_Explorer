import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'indigo' | 'primary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-slate-800 text-slate-200": variant === 'default',
          "border-transparent bg-slate-800/60 text-slate-300": variant === 'secondary',
          "border-slate-700 text-slate-300": variant === 'outline',
          "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === 'success',
          "border-transparent bg-indigo-500/10 text-indigo-400 border-indigo-500/20": variant === 'indigo',
          "border-transparent bg-blue-500/10 text-blue-400 border-blue-500/20": variant === 'primary',
        },
        className
      )}
      {...props}
    />
  );
}
