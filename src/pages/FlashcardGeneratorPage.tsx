// src/pages/FlashcardGeneratorPage.tsx
import { useState, useCallback, useRef } from 'react';
import {
  Loader2,
  WifiOff,
  LayoutDashboard,
  ChevronRight,
  XCircle,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { useFiles } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { useAuth } from '../context/AuthContext';
import { generateFlashcards, FlashcardGenerationResult } from '../services/aiFlashcardGenerator';
import { saveFlashcardStatus, getFlashcardProgress } from '../services/dbApi';
import FlashcardViewer from '../components/flashcards/FlashcardViewer';
import FlashcardControls from '../components/flashcards/FlashcardControls';

export default function FlashcardGeneratorPage() {
  const { files } = useFiles();
  const { records, getRecord, processDocument } = useProcessing();
  const { getAuthHeader } = useAuth();

  // Ref to track the active deck ID for progress save/restore
  const deckIdRef = useRef<string | null>(null);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState<number>(10);
  const [topic, setTopic] = useState<string>('');
  const [view, setView] = useState<'config' | 'loading' | 'flashcards' | 'error'>('config');
  const [flashcards, setFlashcards] = useState<FlashcardGenerationResult['cards']>([]);
  const [source, setSource] = useState<'gemini' | 'mock'>('gemini');
  const [fallbackReason, setFallbackReason] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [knownSet, setKnownSet] = useState<Set<number>>(new Set());

  const selectedFile = files.find((f) => f.id === selectedFileId);
  const processingRecord = selectedFileId ? records[selectedFileId] : undefined;

  const needsProcessing = selectedFileId && (!processingRecord || processingRecord.status !== 'processed');

  const handleProcess = useCallback(async (fileId: string) => {
    await processDocument(fileId);
  }, [processDocument]);

  const startGeneration = useCallback(async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a document first.');
      setView('error');
      return;
    }
    const record = getRecord(selectedFile.id);
    if (!record || record.status !== 'processed' || !record.extractedContent) {
      setErrorMessage('Document not processed yet.');
      setView('error');
      return;
    }
    setView('loading');
    setErrorMessage(undefined);
    try {
      const result = await generateFlashcards({
        documentText: record.extractedContent.fullText,
        documentName: selectedFile.name,
        cardCount,
        topic: topic.trim(),
      });
      setFlashcards(result.cards);
      setSource(result.source);
      setFallbackReason(result.fallbackReason);
      setCurrentIdx(0);

      // Restore persisted known-set from DB (only for gemini decks)
      const newKnownSet = new Set<number>();
      if (result.source === 'gemini') {
        deckIdRef.current = selectedFile.id;
        const { knownIndices } = await getFlashcardProgress(selectedFile.id, getAuthHeader);
        knownIndices.forEach((i) => newKnownSet.add(i));
      } else {
        deckIdRef.current = null;
      }
      setKnownSet(newKnownSet);
      setView('flashcards');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate flashcards.');
      setView('error');
    }
  }, [selectedFile, cardCount, topic, getRecord, getAuthHeader]);


  const handleRegenerate = () => startGeneration();

  const handleShuffle = () => {
    setFlashcards((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIdx(0);
    setKnownSet(new Set());
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setKnownSet(new Set());
  };

  const markKnown = (known: boolean) => {
    const newStatus = known ? 'known' : 'needs_review';
    setKnownSet((prev) => {
      const copy = new Set(prev);
      if (known) copy.add(currentIdx);
      else copy.delete(currentIdx);
      return copy;
    });
    // Persist to DB (fire-and-forget; errors don't block the UI)
    if (deckIdRef.current) {
      saveFlashcardStatus({
        deckId: deckIdRef.current,
        cardIndex: currentIdx,
        status: newStatus,
        getAuthHeader,
      });
    }
  };


  const handleBackToConfig = () => {
    setErrorMessage(undefined);
    setView('config');
  };

  const masteryPercent = flashcards.length > 0
    ? Math.round((knownSet.size / flashcards.length) * 100)
    : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text">Flashcard Generator</span>
      </div>

      {/* Config UI */}
      {view === 'config' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Generate Flashcards</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Document selector */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Study Material</label>
              <select
                className={cn('w-full rounded-xl border border-border bg-white py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60')}
                value={selectedFileId ?? ''}
                onChange={(e) => setSelectedFileId(e.target.value || null)}
              >
                <option value="">-- Select Document --</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Card count */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Number of Cards</label>
              <input
                type="number"
                min={1}
                max={50}
                className={cn('w-full rounded-xl border border-border bg-white py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60')}
                value={cardCount}
                onChange={(e) => setCardCount(Math.max(1, Math.min(50, Number(e.target.value))))}
              />
            </div>
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Topic (optional)</label>
              <input
                type="text"
                placeholder="e.g. Photosynthesis"
                className={cn('w-full rounded-xl border border-border bg-white py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60')}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            {/* Generate button */}
            <div className="flex justify-end">
              <Button variant="primary" onClick={startGeneration} disabled={!selectedFileId}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing banner */}
      {needsProcessing && selectedFileId && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm text-primary">Document needs processing. Click to start.</span>
            <Button variant="outline" size="sm" onClick={() => handleProcess(selectedFileId!)}>
              Process Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {view === 'loading' && (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-lg font-medium text-text">Generating flashcards…</p>
        </div>
      )}

      {/* Flashcard display */}
      {view === 'flashcards' && flashcards.length > 0 && (
        <div className="space-y-4">
          {/* Top navigation & mastery bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToConfig}
              className="gap-1.5 self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Configuration
            </Button>

            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Deck Mastery:{' '}
                <span className="font-semibold text-text">
                  {knownSet.size} of {flashcards.length} mastered
                </span>{' '}
                ({masteryPercent}%)
              </span>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>

          {/* Mock / Offline fallback banner */}
          {source === 'mock' && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-amber-800">
                  Offline mode — generated demo flashcards, not document‑based.
                </p>
                {fallbackReason && (
                  <p className="text-amber-700/90 mt-0.5">
                    Reason: {fallbackReason}
                  </p>
                )}
              </div>
            </div>
          )}

          <FlashcardViewer key={currentIdx} card={flashcards[currentIdx]} />
          <FlashcardControls
            index={currentIdx}
            total={flashcards.length}
            onPrev={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIdx((i) => Math.min(flashcards.length - 1, i + 1))}
            onShuffle={handleShuffle}
            onRestart={handleRestart}
            onRegenerate={handleRegenerate}
            known={knownSet.has(currentIdx)}
            onMarkKnown={markKnown}
          />
        </div>
      )}

      {/* Error */}
      {view === 'error' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-danger">Generation Failed</p>
                <p className="text-sm text-red-700">
                  {errorMessage || 'Failed to generate flashcards. Please try again.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={startGeneration}
                className="gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToConfig}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
