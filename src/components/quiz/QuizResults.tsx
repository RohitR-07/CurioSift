/**
 * QuizResults — Module 7, Phase 1
 *
 * Displays the final quiz results: score, percentage, per-question review,
 * and actions to retry or create another quiz.
 */

import { motion } from 'framer-motion';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { QuizQuestionCard } from './QuizQuestionCard';
import { cn } from '../../utils/cn';
import type { QuizResult, QuizOptionKey } from '../../types/quiz';

interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
  onCreateNew: () => void;
}

function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  const color =
    percentage >= 80 ? '#22C55E' : percentage >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
      {/* Track */}
      <circle
        cx="60" cy="60" r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="10"
      />
      {/* Progress */}
      <motion.circle
        cx="60" cy="60" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        style={{ transformOrigin: 'center', rotate: '-90deg' }}
      />
      {/* Text */}
      <text
        x="60" y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        fontWeight="bold"
        fill={color}
      >
        {percentage}%
      </text>
      <text
        x="60" y="74"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        fill="#64748B"
      >
        Score
      </text>
    </svg>
  );
}

function getGrade(pct: number): { label: string; emoji: string; color: string } {
  if (pct >= 90) return { label: 'Excellent!',       emoji: '🏆', color: 'text-success' };
  if (pct >= 75) return { label: 'Great Job!',        emoji: '🎉', color: 'text-blue-600' };
  if (pct >= 50) return { label: 'Good Effort',       emoji: '👍', color: 'text-warning' };
  return             { label: 'Keep Practising',    emoji: '💪', color: 'text-danger'  };
}

export function QuizResults({ result, onRetry, onCreateNew }: QuizResultsProps) {
  const [expandedReview, setExpandedReview] = useState<Set<string>>(new Set());
  const [showAllReview, setShowAllReview] = useState(false);

  const { score, total, percentage, questionResults, session } = result;
  const grade = getGrade(percentage);
  const showExplanations = session.config.showExplanations;

  const visibleResults = showAllReview ? questionResults : questionResults.slice(0, 3);

  const toggleExpand = (id: string) => {
    setExpandedReview((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ── Score summary ──────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Ring */}
            <div className="shrink-0">
              <ScoreRing percentage={percentage} />
            </div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <p className={cn('text-2xl font-extrabold tracking-tight', grade.color)}>
                  {grade.emoji} {grade.label}
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  You answered{' '}
                  <span className="font-semibold text-text">{score}</span> out of{' '}
                  <span className="font-semibold text-text">{total}</span> questions correctly.
                </p>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm font-medium text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  {score} correct
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-danger">
                  <XCircle className="w-4 h-4" />
                  {total - score} incorrect
                </div>
                {session.source === 'mock' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Sample questions (offline)
                  </div>
                )}
                {session.source === 'gemini' && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    AI-generated from your document
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={onRetry}
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </Button>
            <Button
              variant="outline"
              onClick={onCreateNew}
              className="flex-1 gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Per-question review ────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">Question Review</h3>
          <span className="text-xs text-text-secondary">
            {showExplanations ? 'Explanations enabled' : 'Explanations off'}
          </span>
        </div>

        {visibleResults.map((qr, idx) => (
          <Card key={qr.question.id}>
            <CardContent className="pt-4 pb-4">
              {/* Header row */}
              <button
                onClick={() => toggleExpand(qr.question.id)}
                className="w-full flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg"
                aria-expanded={expandedReview.has(qr.question.id)}
              >
                {qr.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger shrink-0" />
                )}
                <span className="flex-1 text-sm font-medium text-text line-clamp-2">
                  {idx + 1}. {qr.question.question}
                </span>
                {expandedReview.has(qr.question.id) ? (
                  <ChevronUp className="w-4 h-4 text-text-secondary shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {expandedReview.has(qr.question.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 overflow-hidden"
                >
                  <QuizQuestionCard
                    question={qr.question}
                    questionNumber={idx + 1}
                    selectedKey={qr.userAnswer as QuizOptionKey | null}
                    onSelect={() => {}}
                    reviewMode
                    showExplanation={showExplanations}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        ))}

        {questionResults.length > 3 && (
          <button
            onClick={() => setShowAllReview((v) => !v)}
            className="w-full py-2.5 text-sm font-semibold text-primary hover:text-blue-700 flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 hover:border-primary/60 transition-colors"
          >
            {showAllReview ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show all {questionResults.length} questions
              </>
            )}
          </button>
        )}

        {/* Trophy footer */}
        {percentage === 100 && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200">
            <Trophy className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-semibold text-amber-700">
              Perfect score! Outstanding work. 🎊
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
