/**
 * QuizGeneratorPage — Module 7, Phase 2
 *
 * Full quiz flow:
 *   config → (process doc if needed) → loading → quiz → results
 *
 * Phase 2: Calls the backend Gemini endpoint via aiQuizGenerator.
 *           Falls back to mock only on network errors (server unreachable).
 *           Mock generation is NEVER presented as AI-generated.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SendHorizonal,
  AlertCircle,
  Loader2,
  LayoutDashboard,
  Sparkles,
  WifiOff,
  RefreshCw,
  FileWarning,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { QuizConfiguration } from '../components/quiz/QuizConfiguration';
import { QuizQuestionCard } from '../components/quiz/QuizQuestionCard';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizResults } from '../components/quiz/QuizResults';
import { generateAIQuizSession } from '../services/aiQuizGenerator';
import { useFiles } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { useAuth } from '../context/AuthContext';
import { saveQuizAttempt } from '../services/dbApi';
import { cn } from '../utils/cn';
import type {
  QuizConfig,
  QuizPageView,
  GeneratedQuizSession,
  QuizResult,
  QuestionResult,
  UserAnswerMap,
  QuizOptionKey,
} from '../types/quiz';

// ─── Page header ───────────────────────────────────────────────────────────────

function PageHeader({ isMockFallback }: { isMockFallback?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-text-secondary font-medium mb-0.5">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text">Quiz Generator</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-text tracking-tight">
            Quiz Generator
          </h1>
          <p className="text-sm text-text-secondary font-medium">
            Test your knowledge with AI-generated questions from your documents.
          </p>
        </div>
      </div>

      {/* Source badge */}
      {isMockFallback ? (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 self-start">
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-xs font-medium text-amber-700">
            Offline mode — AI server unreachable. Showing sample questions, not document-based.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 self-start">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
          <p className="text-xs font-medium text-violet-700">
            Powered by Gemini AI · Questions generated directly from your document.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Document processing banner ────────────────────────────────────────────────

interface ProcessingBannerProps {
  fileId: string;
  onProcess: (fileId: string) => void;
  isProcessing: boolean;
  errorMessage?: string;
}

function ProcessingBanner({ fileId, onProcess, isProcessing, errorMessage }: ProcessingBannerProps) {
  if (errorMessage) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
        <FileWarning className="w-4 h-4 text-danger shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-danger">Processing failed</p>
          <p className="text-xs text-danger/80 mt-0.5">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProcess(fileId)}
          disabled={isProcessing}
          className="text-danger border-danger/40 hover:bg-red-50 gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
      {isProcessing ? (
        <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
      ) : (
        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary">
          {isProcessing ? 'Extracting document text…' : 'Document needs processing'}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">
          {isProcessing
            ? 'Please wait while we extract the text from your document.'
            : 'This document must be processed before AI questions can be generated.'}
        </p>
      </div>
      {!isProcessing && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onProcess(fileId)}
          className="gap-1.5 shrink-0"
        >
          Process Now
        </Button>
      )}
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen({ config }: { config: QuizConfig }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-bold text-text">Generating your quiz with AI…</p>
        <p className="text-sm text-text-secondary max-w-xs">
          Asking Gemini to create {config.questionCount}{' '}
          {config.difficulty} {config.questionType === 'mixed' ? 'mixed' : config.questionType.toUpperCase()} questions
          {config.topic ? ` about "${config.topic}"` : ' from your document'}.
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Active Quiz ───────────────────────────────────────────────────────────────

interface ActiveQuizProps {
  session: GeneratedQuizSession;
  onComplete: (answers: UserAnswerMap) => void;
}

function ActiveQuiz({ session, onComplete }: ActiveQuizProps) {
  const { questions } = session;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswerMap>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);

  const current = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === questions.length - 1;

  const answeredIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => v !== null)
      .map(([k]) => k),
  );

  const handleSelect = (key: QuizOptionKey) => {
    setAnswers((prev) => ({ ...prev, [current.id]: key }));
    setSubmitError(null);
  };

  const handlePrev = () => {
    setSubmitError(null);
    setShowUnansweredWarning(false);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setSubmitError(null);
    setShowUnansweredWarning(false);
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
  };

  const handleSubmit = () => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowUnansweredWarning(true);
      setSubmitError(
        `You have ${unanswered.length} unanswered question${unanswered.length > 1 ? 's' : ''}. ` +
        `Please answer all questions before submitting.`,
      );
      const firstUnansweredIdx = questions.findIndex((q) => !answers[q.id]);
      setCurrentIndex(firstUnansweredIdx);
      return;
    }
    setSubmitError(null);
    onComplete(answers);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* AI source badge on quiz */}
      {session.source === 'gemini' && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full self-start border border-violet-200 w-fit">
          <Sparkles className="w-3 h-3" />
          AI-generated from your document
        </div>
      )}
      {session.source === 'mock' && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full self-start border border-amber-200 w-fit">
          <WifiOff className="w-3 h-3" />
          Sample questions (offline fallback)
        </div>
      )}

      {/* Progress */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <QuizProgress
            currentIndex={currentIndex}
            total={questions.length}
            answeredIds={answeredIds}
            questionIds={questions.map((q) => q.id)}
          />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <AnimatePresence mode="wait">
            <QuizQuestionCard
              key={current.id}
              question={current}
              questionNumber={currentIndex + 1}
              selectedKey={answers[current.id] ?? null}
              onSelect={handleSelect}
            />
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Validation warning */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
          >
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Cannot submit yet</p>
              <p className="text-xs text-danger/80 mt-0.5">{submitError}</p>
              {showUnansweredWarning && (
                <p className="text-xs text-danger/70 mt-1">
                  Navigated to the first unanswered question. Answer all questions to submit.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex-1" />

        {isLast ? (
          <Button variant="primary" onClick={handleSubmit} className="gap-2">
            <SendHorizonal className="w-4 h-4" />
            Submit Quiz
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Quick-jump dots (desktop) */}
      <div className="hidden md:flex flex-wrap gap-1.5 justify-center pt-1">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => { setSubmitError(null); setCurrentIndex(idx); }}
            aria-label={`Go to question ${idx + 1}`}
            className={cn(
              'w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
              idx === currentIndex
                ? 'bg-primary text-white shadow-sm'
                : answers[q.id]
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-gray-100 text-text-secondary border border-border hover:bg-gray-200',
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function QuizGeneratorPage() {
  const { getFileById } = useFiles();
  const { getRecord, processDocument } = useProcessing();
  const { getAuthHeader } = useAuth();

  const [view, setView]       = useState<QuizPageView>('config');
  const [config, setConfig]   = useState<QuizConfig | null>(null);
  const [session, setSession] = useState<GeneratedQuizSession | null>(null);
  const [result, setResult]   = useState<QuizResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [isMockFallback, setIsMockFallback] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveReason, setSaveReason] = useState<string>('');

  // Processing state for the currently-selected file
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing]         = useState(false);

  // ── Document processing ───────────────────────────────────────────────────
  const handleProcessDocument = useCallback(async (fileId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      await processDocument(fileId);
    } catch (err) {
      // Error is stored in ProcessingContext record; no need to duplicate here
      console.error('[QuizPage] processDocument error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [processDocument]);

  // ── Generation ────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async (cfg: QuizConfig) => {
    setConfig(cfg);
    setError(null);
    setIsMockFallback(false);
    setProcessingFileId(cfg.fileId);

    // ── Check processing state ────────────────────────────────────────────
    const record = getRecord(cfg.fileId);
    const fileRecord = getFileById(cfg.fileId);

    if (!record || record.status === 'idle') {
      // Trigger processing then re-prompt user to generate
      setError('This document has not been processed yet. Please use "Process Now" to extract its text, then generate the quiz.');
      setProcessingFileId(cfg.fileId);
      setView('config');
      // Auto-start processing
      handleProcessDocument(cfg.fileId);
      return;
    }

    if (record.status === 'processing') {
      setError('The document is still being processed. Please wait a moment and try again.');
      setView('config');
      return;
    }

    if (record.status === 'error') {
      setError(
        `Document processing failed: ${record.errorMessage ?? 'Unknown error'}. ` +
        `Please re-process the document before generating a quiz.`
      );
      setView('config');
      return;
    }

    if (!record.extractedContent || !record.extractedContent.fullText.trim()) {
      setError('No readable text was found in this document. It may be a scanned image or an empty file.');
      setView('config');
      return;
    }

    setView('loading');

    try {
      const documentName = fileRecord?.name ?? 'Untitled Document';
      const sess = await generateAIQuizSession(
        cfg,
        record.extractedContent,
        documentName,
      );
      setIsMockFallback(sess.source === 'mock');
      setSession(sess);
      setView('quiz');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.',
      );
      setView('config');
    }
  }, [getRecord, getFileById, handleProcessDocument]);

  // ── Quiz submission ───────────────────────────────────────────────────────
  const handleComplete = useCallback(
    async (answers: UserAnswerMap) => {
      if (!session) return;

      const questionResults: QuestionResult[] = session.questions.map((q) => {
        const userAnswer = (answers[q.id] ?? null) as QuizOptionKey | null;
        return {
          question: q,
          userAnswer,
          isCorrect: userAnswer === q.correctKey,
        };
      });

      const score      = questionResults.filter((r) => r.isCorrect).length;
      const total      = session.questions.length;
      const percentage = Math.round((score / total) * 100);

      const quizResult: QuizResult = { session, questionResults, score, total, percentage, completedAt: Date.now() };
      setResult(quizResult);
      setView('results');

      // Persist to DB (only for AI-generated quizzes, not mock)
      if (session.source === 'gemini') {
        setSaveStatus('saving');
        setSaveReason('');
        const fileRecord = config?.fileId ? getFileById(config.fileId) : undefined;
        const { saved, reason } = await saveQuizAttempt({
          result: quizResult,
          documentId: config?.fileId,
          documentName: fileRecord?.name,
          getAuthHeader,
        });
        setSaveStatus(saved ? 'saved' : 'error');
        if (!saved && reason) setSaveReason(reason);
      }
    },
    [session, config, getFileById, getAuthHeader],
  );


  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    if (config) handleGenerate(config);
  }, [config, handleGenerate]);

  // ── Create new ────────────────────────────────────────────────────────────
  const handleCreateNew = useCallback(() => {
    setSession(null);
    setSaveReason('');
    setResult(null);
    setError(null);
    setIsMockFallback(false);
    setProcessingFileId(null);
    setSaveStatus('idle');
    setView('config');
  }, []);


  // ── Compute processing status for the selected file ───────────────────────
  const processingRecord = processingFileId ? getRecord(processingFileId) : undefined;
  const showProcessingBanner =
    view === 'config' &&
    processingFileId !== null &&
    processingRecord &&
    processingRecord.status !== 'processed';

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <PageHeader isMockFallback={isMockFallback && view === 'quiz'} />

      {/* Processing banner */}
      <AnimatePresence>
        {showProcessingBanner && (
          <motion.div
            key="processing-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ProcessingBanner
              fileId={processingFileId!}
              onProcess={handleProcessDocument}
              isProcessing={isProcessing || processingRecord?.status === 'processing'}
              errorMessage={
                processingRecord?.status === 'error'
                  ? processingRecord.errorMessage
                  : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
          >
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Generation failed</p>
              <p className="text-xs text-danger/80">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-danger/60 hover:text-danger transition-colors text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Views ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === 'config' && (
          <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizConfiguration
              onGenerate={handleGenerate}
              onFileSelect={(fileId) => {
                setProcessingFileId(fileId);
                setError(null);
              }}
            />
          </motion.div>
        )}

        {view === 'loading' && config && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen config={config} />
          </motion.div>
        )}

        {view === 'quiz' && session && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to configuration
            </button>
            <ActiveQuiz session={session} onComplete={handleComplete} />
          </motion.div>
        )}

        {view === 'results' && result && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizResults
              result={result}
              onRetry={handleRetry}
              onCreateNew={handleCreateNew}
            />
            {/* Save status indicator — only shown for AI-generated quizzes */}
            {result.session.source === 'gemini' && saveStatus !== 'idle' && (
              <div className={cn(
                'mt-3 text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit',
                saveStatus === 'saving' && 'text-text-secondary bg-gray-100',
                saveStatus === 'saved' && 'text-green-700 bg-green-50 border border-green-200',
                saveStatus === 'error' && 'text-amber-700 bg-amber-50 border border-amber-200',
              )}>
                {saveStatus === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Saving result…</>}
                {saveStatus === 'saved' && <>✓ Result saved to your history</>}
                {saveStatus === 'error' && (
                  <span title={saveReason || undefined}>
                    ⚠ Could not save result
                    {saveReason ? ` — ${saveReason}` : ' (database not set up yet)'}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
