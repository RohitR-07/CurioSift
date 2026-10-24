import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  className, 
  children, 
  hoverable = false, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card rounded-2xl border border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out overflow-hidden relative",
        hoverable && "hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-primary/30 cursor-pointer group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-bold leading-tight tracking-tight text-text text-lg", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
