/**
 * QuizQuestionCard — Module 7, Phase 1
 *
 * Renders a single quiz question (MCQ or True/False) with selectable option
 * buttons. Handles three visual states per option:
 *   • Default  → neutral border
 *   • Selected (during quiz) → primary ring
 *   • Correct  (results mode) → green
 *   • Incorrect (results mode) → red
 *   • Correct but not chosen (results mode) → green outline
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { QuizQuestion, QuizOptionKey } from '../../types/quiz';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  selectedKey: QuizOptionKey | null;
  onSelect: (key: QuizOptionKey) => void;
  /** When true, shows correct/incorrect styling and reveals explanation */
  reviewMode?: boolean;
  showExplanation?: boolean;
}

export function QuizQuestionCard({
  question,
  questionNumber,
  selectedKey,
  onSelect,
  reviewMode = false,
  showExplanation = false,
}: QuizQuestionCardProps) {
  const getOptionState = (key: QuizOptionKey) => {
    if (!reviewMode) {
      return selectedKey === key ? 'selected' : 'default';
    }
    if (key === question.correctKey) return 'correct';
    if (key === selectedKey && key !== question.correctKey) return 'incorrect';
    return 'default';
  };

  const optionStyles: Record<string, string> = {
    default:   'border-border bg-white hover:border-primary/40 hover:bg-primary/[0.02] text-text',
    selected:  'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10',
    correct:   'border-success bg-success/5 text-success',
    incorrect: 'border-danger bg-danger/5 text-danger',
  };

  const iconMap: Record<string, React.ReactNode> = {
    correct:   <CheckCircle2 className="w-4 h-4 text-success shrink-0" />,
    incorrect: <XCircle      className="w-4 h-4 text-danger  shrink-0" />,
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Question */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Question {questionNumber} ·{' '}
          <span className="normal-case">
            {question.type === 'true-false' ? 'True / False' : 'Multiple Choice'}
          </span>
        </p>
        <h2 className="text-lg font-semibold text-text leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
        {question.options.map((option) => {
          const state = getOptionState(option.key);
          const isSelectable = !reviewMode;

          return (
            <motion.button
              key={option.key}
              whileTap={isSelectable ? { scale: 0.99 } : undefined}
              onClick={() => isSelectable && onSelect(option.key)}
              disabled={!isSelectable}
              role="radio"
              aria-checked={selectedKey === option.key}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                optionStyles[state],
                isSelectable && 'cursor-pointer',
                !isSelectable && 'cursor-default',
              )}
            >
              {/* Key badge */}
              <span
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                  state === 'selected'   && 'bg-primary text-white',
                  state === 'correct'    && 'bg-success text-white',
                  state === 'incorrect'  && 'bg-danger  text-white',
                  state === 'default'    && 'bg-gray-100 text-text-secondary',
                )}
              >
                {option.key}
              </span>

              {/* Option text */}
              <span className="flex-1 text-sm font-medium leading-snug">
                {option.text}
              </span>

              {/* Review icon */}
              {reviewMode && iconMap[state]}

              {/* Radio dot (quiz mode only) */}
              {!reviewMode && (
                <Circle
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    state === 'selected' ? 'text-primary fill-primary' : 'text-gray-300',
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation (review mode only, if enabled) */}
      <AnimatePresence>
        {reviewMode && showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mt-1">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-primary">Explanation</p>
                <p className="text-sm text-text leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
