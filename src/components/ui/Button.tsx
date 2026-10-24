import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";
  
  const variants = {
    primary: "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_6px_20px_rgba(37,99,235,0.35)] border border-blue-400/30",
    secondary: "bg-gray-100 hover:bg-gray-200 text-text border border-border/60 shadow-sm",
    outline: "border border-border/80 bg-white/70 hover:bg-gray-50 text-text shadow-sm backdrop-blur-sm hover:border-gray-300",
    ghost: "bg-transparent hover:bg-gray-100/70 text-text hover:text-text",
    danger: "bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20 border border-red-400/30",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-xs font-semibold gap-1.5",
    md: "h-11 px-5 text-sm font-semibold gap-2",
    lg: "h-13 px-7 text-base font-bold gap-2.5",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
