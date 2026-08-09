import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ImageIcon,
  FileVideo,
  Music,
  Code,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';

import { useFiles, FileCategory } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { useStudyMaterial } from '../context/StudyMaterialContext';
import { useToast } from '../context/ToastContext';

import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { GeneratedContentView } from '../components/study/GeneratedContent';

import type {
  MaterialType,
  SummaryLength,
  NoteLength,
  QuizDifficulty,
  QuizCount,
  GenerationConfig,
} from '../types/studyMaterial';

// ─── Constants ───────────────────────────────────────────────────────────────

const MATERIAL_TABS: { type: MaterialType; label: string; icon: typeof FileText }[] = [
  { type: 'summary', label: 'Summary', icon: FileText },
  { type: 'notes', label: 'Notes', icon: BookOpen },
  { type: 'quiz', label: 'MCQ Practice', icon: HelpCircle },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">
        {label}
      </p>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

function OptionChip({
  active,
  disabled,
  onClick,
  label,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50',
        active
          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
          : 'border-gray-200 text-text-secondary hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      {label}
    </button>
  );
}

function getCategoryIcon(cat: FileCategory, cls = 'w-5 h-5') {
  switch (cat) {
    case 'pdf':
    case 'document': return <FileText className={cls} />;
    case 'image': return <ImageIcon className={cls} />;
    case 'video': return <FileVideo className={cls} />;
    case 'audio': return <Music className={cls} />;
    case 'code': return <Code className={cls} />;
    case 'spreadsheet': return <FileSpreadsheet className={cls} />;
    case 'presentation': return <Presentation className={cls} />;
    default: return <FileText className={cls} />;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyWorkspacePage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { files, isLoaded: filesLoaded } = useFiles();
  const { getRecord } = useProcessing();
  const { getLatestMaterial, generate } = useStudyMaterial();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<MaterialType>('summary');

  // Form state
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [noteLength, setNoteLength] = useState<NoteLength>('concise');
  const [questionCount, setQuestionCount] = useState<QuizCount>(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Esc key back navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(`/viewer/${fileId}`);
    },
    [navigate, fileId],
  );
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!filesLoaded || !fileId) return null;
  const fileRecord = files.find((f) => f.id === fileId);

  // Fallbacks if directly accessed incorrectly
  if (!fileRecord) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-text">Document Not Found</h2>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const processingRecord = getRecord(fileId);
  if (!processingRecord || processingRecord.status !== 'processed') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center gap-4">
        <BrainCircuit className="w-12 h-12 text-blue-500" />
        <h2 className="text-xl font-bold text-text">Document Not Processed</h2>
        <p className="text-text-secondary">You must process the document before generating study materials.</p>
        <Button onClick={() => navigate(`/viewer/${fileId}`)}>Back to Document</Button>
      </div>
    );
  }

  const activeMaterial = getLatestMaterial(fileId, activeTab);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationError(null);

    const config: GenerationConfig = {
      type: activeTab,
      summaryLength: activeTab === 'summary' ? summaryLength : undefined,
      noteLength: activeTab === 'notes' ? noteLength : undefined,
      questionCount: activeTab === 'quiz' ? questionCount : undefined,
      difficulty: activeTab === 'quiz' ? difficulty : undefined,
    };

    try {
      const id = await generate(fileId, config);
      if (id) toast(`${activeTab} generated successfully!`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed.';
      setGenerationError(msg);
      toast(msg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render Form ──────────────────────────────────────────────────────────────
  const renderGenerationForm = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-extrabold text-text mb-3 text-center">
          Generate {MATERIAL_TABS.find(t => t.type === activeTab)?.label}
        </h2>
        
        <p className="text-text-secondary text-center max-w-md mb-12">
          Turn your processed document into AI-ready study materials. Customize your generation options below.
        </p>

        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {activeTab === 'summary' && (
            <OptionGroup label="Summary Length">
              {(['short', 'medium', 'detailed'] as SummaryLength[]).map((l) => (
                <OptionChip
                  key={l}
                  active={summaryLength === l}
                  disabled={isGenerating}
                  onClick={() => setSummaryLength(l)}
                  label={l.charAt(0).toUpperCase() + l.slice(1)}
                />
              ))}
            </OptionGroup>
          )}

          {activeTab === 'notes' && (
            <OptionGroup label="Notes Detail">
              {(['concise', 'detailed'] as NoteLength[]).map((l) => (
                <OptionChip
                  key={l}
                  active={noteLength === l}
                  disabled={isGenerating}
                  onClick={() => setNoteLength(l)}
                  label={l.charAt(0).toUpperCase() + l.slice(1)}
                />
              ))}
            </OptionGroup>
          )}

          {activeTab === 'quiz' && (
            <>
              <OptionGroup label="Number of Questions">
                {([5, 10, 15] as QuizCount[]).map((n) => (
                  <OptionChip
                    key={n}
                    active={questionCount === n}
                    disabled={isGenerating}
                    onClick={() => setQuestionCount(n)}
                    label={`${n} Questions`}
                  />
                ))}
              </OptionGroup>
              <OptionGroup label="Difficulty Level">
                {(['easy', 'medium', 'hard'] as QuizDifficulty[]).map((d) => (
                  <OptionChip
                    key={d}
                    active={difficulty === d}
                    disabled={isGenerating}
                    onClick={() => setDifficulty(d)}
                    label={d.charAt(0).toUpperCase() + d.slice(1)}
                  />
                ))}
              </OptionGroup>
            </>
          )}

          {generationError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 leading-relaxed">{generationError}</p>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : generationError ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Retry Generation
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate {MATERIAL_TABS.find(t => t.type === activeTab)?.label}
              </>
            )}
          </Button>
          
          <p className="text-xs text-text-secondary/70 text-center mt-4">
            Using demo generation for Phase 3 UI.
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-8 h-auto sm:h-16 bg-white border-b border-gray-200 py-3 sm:py-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/viewer/${fileId}`)}
            className="p-2 -ml-2 rounded-xl text-text-secondary hover:text-primary hover:bg-blue-50 transition-colors"
            title="Back to Document (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
              {getCategoryIcon(fileRecord.category, 'w-4 h-4')}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Study Material Workspace
              </p>
              <h1 className="text-sm font-bold text-text truncate max-w-[200px] md:max-w-md">
                {fileRecord.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {MATERIAL_TABS.map((tab) => {
            const isActive = activeTab === tab.type;
            const Icon = tab.icon;
            return (
              <button
                key={tab.type}
                onClick={() => {
                  setActiveTab(tab.type);
                  setGenerationError(null);
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white text-text shadow-sm ring-1 ring-gray-900/5'
                    : 'text-text-secondary hover:text-text hover:bg-gray-200/50',
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "opacity-70")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (activeMaterial ? '-content' : '-form')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeMaterial?.content ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
                <GeneratedContentView content={activeMaterial.content} />
                
                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Regenerating...</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate {MATERIAL_TABS.find(t => t.type === activeTab)?.label}</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              renderGenerationForm()
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
