
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p-8 rounded-2xl border-2 border-dashed border-border bg-gray-50 flex flex-col items-center justify-center text-center gap-3", className)}
    >
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-1">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-text">{title}</h3>
      <p className="text-sm text-text-secondary max-w-[250px] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-2 text-sm h-9" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
