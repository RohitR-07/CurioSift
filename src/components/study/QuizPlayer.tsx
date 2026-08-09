/**
 * QuizPlayer — Module 5 Phase 3
 *
 * Interactive quiz: select answers, navigate questions, submit, view score.
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import type { GeneratedQuiz } from '../../types/studyMaterial';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface QuizPlayerProps {
  quiz: GeneratedQuiz;
}

type AnswerMap = Record<string, string>; // questionId → selected option

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const current = quiz.questions[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;
  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  const score = submitted
    ? quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length
    : 0;

  const selectAnswer = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
  };

  const handleSubmit = () => {
    if (allAnswered && !submitted) setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentIdx(0);
  };

  // ── Submitted / Results screen ────────────────────────────────────────────
  if (submitted) {
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 60;

    return (
      <div className="flex flex-col gap-6">
        {/* Score banner */}
        <div
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-2xl border text-center',
            passed
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200',
          )}
        >
          <Trophy
            className={cn('w-10 h-10', passed ? 'text-green-600' : 'text-amber-500')}
          />
          <div>
            <p className={cn('text-3xl font-extrabold', passed ? 'text-green-700' : 'text-amber-700')}>
              {score} / {total}
            </p>
            <p className={cn('text-sm font-semibold mt-1', passed ? 'text-green-600' : 'text-amber-600')}>
              {percent}% — {passed ? 'Well done! 🎉' : 'Keep studying! 📚'}
            </p>
          </div>
        </div>

        {/* Per-question review */}
        <div className="space-y-3">
          {quiz.questions.map((q, i) => {
            const selected = answers[q.id];
            const correct = selected === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-xl border p-4',
                  correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
                )}
              >
                <div className="flex items-start gap-2 mb-2">
                  {correct ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-semibold text-text">
                    Q{i + 1}: {q.question}
                  </p>
                </div>
                {!correct && (
                  <p className="text-xs text-red-600 ml-6">
                    Your answer: <span className="font-medium">{selected ?? '—'}</span>
                  </p>
                )}
                <p className="text-xs text-green-700 ml-6 font-medium">
                  Correct: {q.correctAnswer}
                </p>
                {q.explanation && (
                  <p className="text-xs text-text-secondary ml-6 mt-1 italic">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full justify-center">
          Retake Quiz
        </Button>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────
  const selectedAnswer = answers[current.id];

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
        <span>Question {currentIdx + 1} of {total}</span>
        <span>{Object.keys(answers).length} answered</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm font-semibold text-text leading-relaxed">{current.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5" role="radiogroup" aria-label="Answer choices">
        {current.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectAnswer(opt)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                  : 'border-gray-200 bg-white hover:border-primary/40 hover:bg-blue-50/40 text-text',
              )}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIdx((i) => i - 1)}
          disabled={isFirst}
          aria-label="Previous question"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        {isLast ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="flex-1"
            aria-label="Submit quiz"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setCurrentIdx((i) => i + 1)}
            aria-label="Next question"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {!allAnswered && isLast && (
        <p className="text-xs text-text-secondary text-center">
          Answer all questions before submitting.
        </p>
      )}
    </div>
  );
}
