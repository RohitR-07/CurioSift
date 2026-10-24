/**
 * QuizProgress — Module 7, Phase 1
 *
 * Displays the current question number and a segmented progress bar where
 * each segment represents one question and is colour-coded:
 *   • answered  → blue (primary)
 *   • current   → indigo (slightly lighter)
 *   • unanswered → gray
 */

import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface QuizProgressProps {
  currentIndex: number;   // 0-based
  total: number;
  answeredIds: Set<string>;
  questionIds: string[];
}

export function QuizProgress({
  currentIndex,
  total,
  answeredIds,
  questionIds,
}: QuizProgressProps) {
  const pct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="space-y-2.5">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
        <span>
          Question{' '}
          <span className="text-primary">{currentIndex + 1}</span> of {total}
        </span>
        <span className="text-text-secondary">
          {answeredIds.size}/{total} answered
        </span>
      </div>

      {/* Segmented bar */}
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${currentIndex + 1} of ${total}`}
      >
        {questionIds.map((id, idx) => {
          const isAnswered = answeredIds.has(id);
          const isCurrent  = idx === currentIndex;
          const isPast     = idx < currentIndex;

          return (
            <motion.div
              key={id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                isCurrent
                  ? 'bg-primary'
                  : isAnswered || isPast
                  ? isAnswered
                    ? 'bg-primary/70'
                    : 'bg-gray-200'
                  : 'bg-gray-200',
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: idx * 0.02, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
          );
        })}
      </div>

      {/* Percentage */}
      <p className="text-[11px] text-text-secondary text-right">{pct}% complete</p>
    </div>
  );
}
