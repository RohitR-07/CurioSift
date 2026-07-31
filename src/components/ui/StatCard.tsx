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
    const duration = 1500;
    
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
    <Card hoverable className="group">
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={cn("p-3.5 rounded-2xl shadow-sm transition-transform group-hover:scale-110", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
        <div>
          <p className="text-3xl font-extrabold text-text tracking-tight flex items-baseline">
            {count}{suffix}
          </p>
          <p className="text-sm font-semibold text-text-secondary mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
