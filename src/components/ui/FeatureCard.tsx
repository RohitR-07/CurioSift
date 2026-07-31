
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientClass: string;
  shadowClass?: string;
  badge?: string;
}

export function FeatureCard({ title, description, icon: Icon, gradientClass, shadowClass, badge }: FeatureCardProps) {
  return (
    <Card hoverable className="h-full group">
      <CardContent className="p-6 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
            gradientClass,
            shadowClass
          )}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-gray-100">
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <h4 className="font-bold text-text mb-1 text-lg">{title}</h4>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
