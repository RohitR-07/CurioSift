/**
 * QuizConfiguration — Module 7, Phase 1
 *
 * Study material selector + quiz configuration form.
 * Reads uploaded files from FileContext and presents all quiz config options.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Code,
  FileSpreadsheet,
  Presentation,
  Music,
  Video,
  File,
  ChevronRight,
  GraduationCap,
  Sliders,
  CheckSquare,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';
import { useFiles } from '../../context/FileContext';
import type { FileRecord } from '../../context/FileContext';
import type {
  QuizConfig,
  QuizQuestionCount,
  QuizDifficultyLevel,
  QuizQuestionType,
} from '../../types/quiz';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FileIcon({ category, className }: { category: FileRecord['category']; className?: string }) {
  const cls = cn('w-5 h-5 shrink-0', className);
  switch (category) {
    case 'pdf':          return <FileText      className={cn(cls, 'text-red-500')}    />;
    case 'image':        return <Image        className={cn(cls, 'text-blue-400')}   />;
    case 'code':         return <Code         className={cn(cls, 'text-green-500')}  />;
    case 'spreadsheet':  return <FileSpreadsheet className={cn(cls, 'text-emerald-500')} />;
    case 'presentation': return <Presentation className={cn(cls, 'text-orange-500')} />;
    case 'audio':        return <Music        className={cn(cls, 'text-pink-500')}   />;
    case 'video':        return <Video        className={cn(cls, 'text-purple-500')} />;
    case 'document':     return <FileText     className={cn(cls, 'text-blue-600')}   />;
    default:             return <File         className={cn(cls, 'text-gray-400')}   />;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// ─── Option Button ────────────────────────────────────────────────────────────

interface OptionBtnProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}

function OptionBtn({ label, selected, onClick, description }: OptionBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 flex-1 min-w-0',
        selected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border hover:border-primary/40 hover:bg-gray-50 text-text',
      )}
      aria-pressed={selected}
    >
      <span className={cn('text-sm font-semibold', selected ? 'text-primary' : 'text-text')}>
        {label}
      </span>
      {description && (
        <span className="text-[11px] text-text-secondary leading-tight">{description}</span>
      )}
    </button>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function ConfigSection({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface QuizConfigurationProps {
  onGenerate: (config: QuizConfig) => void;
  onFileSelect: (fileId: string) => void;
}

const QUESTION_COUNTS: QuizQuestionCount[] = [5, 10, 15, 20];

const QUESTION_TYPES: { value: QuizQuestionType; label: string; desc: string }[] = [
  { value: 'mcq',        label: 'Multiple Choice', desc: '4 options per question' },
  { value: 'true-false', label: 'True / False',    desc: '2 options per question' },
  { value: 'mixed',      label: 'Mixed',           desc: 'Combination of both'   },
];

const DIFFICULTIES: { value: QuizDifficultyLevel; label: string; desc: string; color: string }[] = [
  { value: 'easy',   label: 'Easy',   desc: 'Recall & basics',    color: 'text-success' },
  { value: 'medium', label: 'Medium', desc: 'Application level',  color: 'text-warning' },
  { value: 'hard',   label: 'Hard',   desc: 'Analysis & synthesis', color: 'text-danger'  },
];

export function QuizConfiguration({ onGenerate, onFileSelect }: QuizConfigurationProps) {
  const { files, isLoaded } = useFiles();
  const navigate = useNavigate();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [questionCount, setQuestionCount]     = useState<QuizQuestionCount>(10);
  const [questionType, setQuestionType]       = useState<QuizQuestionType>('mcq');
  const [difficulty, setDifficulty]           = useState<QuizDifficultyLevel>('medium');
  const [topic, setTopic]                     = useState('');
  const [showExplanations, setShowExplanations] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!selectedFileId) {
      setValidationError('Please select a study material to continue.');
      return;
    }
    setValidationError(null);
    onGenerate({
      fileId: selectedFileId,
      questionCount,
      questionType,
      difficulty,
      topic: topic.trim(),
      showExplanations,
    });
  };

  const selectedFile = files.find((f) => f.id === selectedFileId);

  // Loading skeleton
  if (!isLoaded) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── 1. Material Selection ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Study Material</CardTitle>
          </div>
          <p className="text-xs text-text-secondary">
            Select a document to generate questions from.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {files.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="No study materials yet"
              description="Upload a PDF or document from the Dashboard to get started."
              actionLabel="Go to Dashboard"
              onAction={() => navigate('/dashboard')}
            />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => { setSelectedFileId(file.id); setValidationError(null); onFileSelect(file.id); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    selectedFileId === file.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-gray-50',
                  )}
                  aria-pressed={selectedFileId === file.id}
                >
                  <FileIcon category={file.category} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-semibold truncate',
                      selectedFileId === file.id ? 'text-primary' : 'text-text',
                    )}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      {file.extension.toUpperCase()} · {formatBytes(file.size)} · {formatDate(file.uploadTime)}
                    </p>
                  </div>
                  {selectedFileId === file.id && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Configuration (only when a file is chosen) ─────── */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Quiz Settings</CardTitle>
              </div>
              <p className="text-xs text-text-secondary">
                Generating from: <span className="font-semibold text-text">{selectedFile.name}</span>
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">

              {/* Number of questions */}
              <ConfigSection icon={GraduationCap} title="Number of Questions">
                <div className="flex gap-2 flex-wrap">
                  {QUESTION_COUNTS.map((n) => (
                    <OptionBtn
                      key={n}
                      label={`${n}`}
                      selected={questionCount === n}
                      onClick={() => setQuestionCount(n)}
                    />
                  ))}
                </div>
              </ConfigSection>

              {/* Question type */}
              <ConfigSection icon={CheckSquare} title="Question Type">
                <div className="flex gap-2 flex-wrap">
                  {QUESTION_TYPES.map((t) => (
                    <OptionBtn
                      key={t.value}
                      label={t.label}
                      description={t.desc}
                      selected={questionType === t.value}
                      onClick={() => setQuestionType(t.value)}
                    />
                  ))}
                </div>
              </ConfigSection>

              {/* Difficulty */}
              <ConfigSection icon={Sliders} title="Difficulty Level">
                <div className="flex gap-2 flex-wrap">
                  {DIFFICULTIES.map((d) => (
                    <OptionBtn
                      key={d.value}
                      label={d.label}
                      description={d.desc}
                      selected={difficulty === d.value}
                      onClick={() => setDifficulty(d.value)}
                    />
                  ))}
                </div>
              </ConfigSection>

              {/* Topic */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-text" htmlFor="quiz-topic">
                  Topic / Chapter <span className="text-xs font-normal text-text-secondary">(optional)</span>
                </label>
                <input
                  id="quiz-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Chapter 3: Photosynthesis — or leave blank for entire document"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all"
                />
              </div>

              {/* Explanations toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold text-text">Show Explanations</p>
                  <p className="text-xs text-text-secondary">
                    Reveal answer explanations after quiz submission.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showExplanations}
                  onClick={() => setShowExplanations((v) => !v)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    showExplanations ? 'bg-primary' : 'bg-gray-200',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300',
                      showExplanations && 'translate-x-5',
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Validation error ───────────────────────────────────── */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">{validationError}</p>
        </motion.div>
      )}

      {/* ── Generate Button ────────────────────────────────────── */}
      <Button
        variant="primary"
        size="lg"
        className="w-full gap-2"
        onClick={handleGenerate}
        disabled={files.length === 0}
      >
        <GraduationCap className="w-5 h-5" />
        Generate Quiz
        <ChevronRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}
