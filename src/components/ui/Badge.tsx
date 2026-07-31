import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'new' | 'beta';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-text-secondary border border-gray-200",
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    new: "bg-blue-500 text-white border-transparent",
    beta: "bg-purple-100 text-purple-700 border border-purple-200",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
