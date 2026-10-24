// src/pages/RevisionNotesPage.tsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  BookMarked,
  FunctionSquare,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useFiles } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { generateNotes } from '../services/aiNotesGenerator';
import type { RevisionNotes, NotesSection } from '../services/aiNotesGenerator';
import { cn } from '../utils/cn';

// ─── Saved note shape ─────────────────────────────────────────────────────────

interface SavedNote {
  id: string;
  documentName: string;
  topic: string;
  notes: RevisionNotes;
  generatedAt: number;
}

// ─── Section accordion ────────────────────────────────────────────────────────

function NotesSectionCard({ section, index }: { section: NotesSection; index: number }) {
  const [open, setOpen] = useState(index === 0); // first section open by default

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{index + 1}</span>
          </div>
          <span className="font-semibold text-text text-sm sm:text-base">{section.heading}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-secondary shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border">

              {/* Key Points */}
              {section.keyPoints.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Key Points</span>
                  </div>
                  <ul className="space-y-1.5">
                    {section.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Definitions */}
              {section.definitions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Definitions</span>
                  </div>
                  <div className="space-y-2">
                    {section.definitions.map((d, i) => (
                      <div key={i} className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5">
                        <span className="font-semibold text-blue-800 text-sm">{d.term}: </span>
                        <span className="text-blue-700 text-sm">{d.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas */}
              {section.formulas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FunctionSquare className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Formulas</span>
                  </div>
                  <div className="space-y-2">
                    {section.formulas.map((f, i) => (
                      <div key={i} className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-2.5">
                        <div className="text-xs font-semibold text-purple-700 mb-1">{f.label}</div>
                        <code className="text-sm font-mono text-purple-900 bg-purple-100 px-2 py-0.5 rounded">{f.expression}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section summary */}
              {section.summary && (
                <p className="text-sm text-text-secondary italic border-l-2 border-gray-200 pl-3 mt-2">
                  {section.summary}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Quick Recap panel ────────────────────────────────────────────────────────

function QuickRecap({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <CardTitle className="text-sm text-amber-800">Quick Recap — Last-Minute Points</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <span className="mt-1 text-amber-500 font-bold text-xs shrink-0">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RevisionNotesPage() {
  const { files } = useFiles();
  const { records, getRecord, processDocument } = useProcessing();

  // Config state
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');

  // Generation state
  const [view, setView] = useState<'config' | 'loading' | 'notes' | 'error'>('config');
  const [notes, setNotes] = useState<RevisionNotes | null>(null);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Saved notes (session memory)
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const selectedFile = files.find(f => f.id === selectedFileId);
  const processingRecord = selectedFileId ? records[selectedFileId] : undefined;
  const needsProcessing = selectedFileId &&
    (!processingRecord || processingRecord.status !== 'processed');

  const handleProcess = useCallback(async (fileId: string) => {
    setIsProcessing(true);
    try { await processDocument(fileId); }
    catch { /* error visible in processingRecord */ }
    finally { setIsProcessing(false); }
  }, [processDocument]);

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return;
    const record = getRecord(selectedFile.id);
    if (!record || record.status !== 'processed' || !record.extractedContent) {
      setErrorMessage('Document not processed yet. Please process it first.');
      setView('error');
      return;
    }
    setView('loading');
    setErrorMessage(null);
    try {
      const result = await generateNotes({
        documentText: record.extractedContent.fullText,
        documentName: selectedFile.name,
        topic: topic.trim(),
      });
      setNotes(result.notes);
      setGeneratedAt(result.generatedAt);
      setView('notes');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate revision notes.');
      setView('error');
    }
  }, [selectedFile, topic, getRecord]);

  const handleSave = () => {
    if (!notes || !selectedFile) return;
    const id = `${selectedFile.id}-${Date.now()}`;
    setSavedNotes(prev => [
      { id, documentName: selectedFile.name, topic, notes, generatedAt: generatedAt ?? Date.now() },
      ...prev,
    ]);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleLoadSaved = (saved: SavedNote) => {
    setNotes(saved.notes);
    setGeneratedAt(saved.generatedAt);
    setSelectedFileId(files.find(f => f.name === saved.documentName)?.id ?? null);
    setTopic(saved.topic);
    setView('notes');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleBack = () => {
    setView('config');
    setErrorMessage(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium mb-1">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text">Revision Notes</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text tracking-tight">Revision Notes</h1>
            <p className="text-sm text-text-secondary font-medium">AI-generated structured notes from your documents.</p>
          </div>
        </div>
      </div>

      {/* Config view */}
      {view === 'config' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Select Document
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {files.length === 0 ? (
                <p className="text-sm text-text-secondary">No documents uploaded yet. Go to the Dashboard to upload a PDF.</p>
              ) : (
                <div className="space-y-2">
                  {files.map(file => {
                    const rec = records[file.id];
                    const processed = rec?.status === 'processed';
                    const processing = rec?.status === 'processing';
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                          selectedFileId === file.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <FileText className={cn('w-4 h-4 shrink-0', processed ? 'text-green-500' : 'text-text-secondary')} />
                        <span className="text-sm font-medium text-text truncate flex-1">{file.name}</span>
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
                          processed ? 'bg-green-100 text-green-700' :
                          processing ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500'
                        )}>
                          {processed ? 'Ready' : processing ? 'Processing…' : 'Not processed'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Process banner */}
              {needsProcessing && processingRecord?.status !== 'processing' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-800 flex-1">This document needs to be processed before generating notes.</span>
                  <Button size="sm" variant="secondary" onClick={() => handleProcess(selectedFileId!)} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Process'}
                  </Button>
                </div>
              )}
              {processingRecord?.status === 'processing' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" /> Extracting document text…
                </div>
              )}
              {processingRecord?.status === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" /> Processing failed: {processingRecord.errorMessage}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topic filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Topic Filter <span className="text-text-secondary font-normal">(optional)</span></CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, World War II, Cell Division…"
                className="w-full rounded-xl border border-border bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <p className="text-xs text-text-secondary mt-1.5">Leave blank to generate notes for the entire document.</p>
            </CardContent>
          </Card>

          <Button
            className="w-full h-11 text-base font-bold"
            onClick={handleGenerate}
            disabled={!selectedFileId || needsProcessing || processingRecord?.status === 'processing'}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Revision Notes
          </Button>

          {/* Saved notes list */}
          {savedNotes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-text">Saved Notes ({savedNotes.length})</h2>
              {savedNotes.map(saved => (
                <div key={saved.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white hover:border-gray-300 transition-colors">
                  <BookOpen className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{saved.notes.title}</p>
                    <p className="text-xs text-text-secondary truncate">{saved.documentName}{saved.topic ? ` · ${saved.topic}` : ''}</p>
                  </div>
                  <button onClick={() => handleLoadSaved(saved)} className="text-xs text-primary font-semibold hover:underline shrink-0">Open</button>
                  <button onClick={() => handleDeleteSaved(saved.id)} className="text-text-secondary hover:text-danger transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Loading view */}
      {view === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-5"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border-2 border-orange-400/30 animate-ping" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-text">Generating Revision Notes</p>
            <p className="text-sm text-text-secondary">
              Analysing document{topic ? ` · Topic: "${topic}"` : ''}…
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
        </motion.div>
      )}

      {/* Error view */}
      {view === 'error' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">Generation failed</p>
                  <p className="text-red-700 text-sm mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBack} variant="secondary">Back to Config</Button>
                <Button size="sm" onClick={handleGenerate}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes view */}
      {view === 'notes' && notes && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Notes header bar */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-extrabold text-text tracking-tight">{notes.title}</h2>
              {topic && <p className="text-sm text-text-secondary mt-0.5">Topic: <span className="font-semibold text-primary">{topic}</span></p>}
              <p className="text-xs text-text-secondary mt-0.5">{notes.sections.length} sections · {generatedAt ? new Date(generatedAt).toLocaleTimeString() : ''}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={handleBack}>
                ← New Notes
              </Button>
              <Button size="sm" variant="secondary" onClick={handleGenerate}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saveFeedback}>
                {saveFeedback
                  ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Saved!</>
                  : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
              </Button>
            </div>
          </div>

          {/* Quick Recap */}
          <QuickRecap items={notes.quickRecap} />

          {/* Sections */}
          <div className="space-y-3">
            {notes.sections.map((section, i) => (
              <NotesSectionCard key={i} section={section} index={i} />
            ))}
          </div>

          {/* Bottom actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={handleBack}>← New Notes</Button>
            <Button size="sm" onClick={handleSave} disabled={saveFeedback}>
              {saveFeedback ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Saved!</> : <><Save className="w-3.5 h-3.5 mr-1" /> Save Notes</>}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
