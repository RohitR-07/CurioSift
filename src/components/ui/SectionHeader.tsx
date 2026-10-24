import React from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, action, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      <h2 className="text-lg sm:text-xl font-extrabold text-text tracking-tight">{title}</h2>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
