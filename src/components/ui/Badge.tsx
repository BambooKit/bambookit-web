import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#151b1e] text-[#94a3b8] border-[#1c2529]',
    success: 'bg-[#10b981]/10 text-[#34d399] border-[#10b981]/20',
    warning: 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/20',
    danger: 'bg-[#ef4444]/10 text-[#f87171] border-[#ef4444]/20',
    info: 'bg-[#06b6d4]/10 text-[#22d3ee] border-[#06b6d4]/20',
    outline: 'bg-transparent text-[#94a3b8] border-[#27343a]',
  };

  const dotColors = {
    default: 'bg-[#64748b]',
    success: 'bg-[#10b981]',
    warning: 'bg-[#f59e0b]',
    danger: 'bg-[#ef4444]',
    info: 'bg-[#06b6d4]',
    outline: 'bg-[#94a3b8]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
