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
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    secondary: "bg-gray-100 text-text hover:bg-gray-200 shadow-sm",
    outline: "border border-border bg-transparent hover:bg-gray-50 hover:border-gray-300 text-text",
    ghost: "bg-transparent hover:bg-gray-100/80 text-text",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm gap-2",
    md: "h-11 px-6 text-sm gap-2",
    lg: "h-14 px-8 text-base gap-3",
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
