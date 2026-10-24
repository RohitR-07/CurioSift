import { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export function StatCard({ label, value, suffix = '', icon: Icon, colorClass, bgClass }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1200;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <Card hoverable className="group relative overflow-hidden">
      {/* Subtle top border highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-text tracking-tight flex items-baseline">
            {count}{suffix}
          </p>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
      </CardContent>
    </Card>
  );
}
