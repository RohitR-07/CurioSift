/**
 * ProcessingPanel — Module 5 Phase 2
 *
 * Renders the "Process Document" action and live status inside the
 * FileViewerPage sidebar. Reuses all existing UI conventions (Button, colors,
 * spacing, icons from lucide-react, toast system).
 *
 * Statuses handled:
 *   idle       → "Process Document" button
 *   processing → spinner + "Processing…" text (button disabled)
 *   processed  → green checkmark, word/char/page stats, extracted text preview
 *   error      → red error message + "Retry" button
 */

import { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useProcessing } from '../../context/ProcessingContext';
import { isProcessable } from '../../services/documentProcessor';
import { FileCategory } from '../../context/FileContext';
import { cn } from '../../utils/cn';

interface ProcessingPanelProps {
  fileId: string;
  category: FileCategory;
  extension: string;
}

export function ProcessingPanel({ fileId, category, extension }: ProcessingPanelProps) {
  const { getRecord, processDocument } = useProcessing();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const record = getRecord(fileId);
  const status = record?.status ?? 'idle';
  const canProcess = isProcessable(category);

  const handleProcess = async () => {
    if (status === 'processing' || isStarting) return;
    setIsStarting(true);
    try {
      await processDocument(fileId);
    } finally {
      setIsStarting(false);
    }
  };

  // ── Unsupported file type ─────────────────────────────────────────────────
  if (!canProcess) {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3">
          Document Processing
        </p>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-text-secondary">
          <Cpu className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Processing is not available for{' '}
            <span className="font-semibold uppercase">.{extension}</span> files. Supported types:
            PDF, TXT, MD, CSV, code files.
          </p>
        </div>
      </div>
    );
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3">
          Document Processing
        </p>
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          Extract the text content from this document to enable AI-powered study features.
        </p>
        <Button
          onClick={handleProcess}
          disabled={isStarting}
          className="w-full justify-center"
          aria-label="Process this document to extract text"
        >
          <Cpu className="w-4 h-4 mr-2" />
          Process Document
        </Button>
      </div>
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3">
          Document Processing
        </p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Processing…</p>
            <p className="text-xs text-blue-500 mt-0.5">Extracting text content</p>
          </div>
        </div>
        <Button
          disabled
          className="w-full justify-center mt-3 opacity-60 cursor-not-allowed"
          aria-busy="true"
          aria-label="Processing in progress"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing…
        </Button>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3">
          Document Processing
        </p>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed" role="alert">
            {record?.errorMessage ?? 'Processing failed. Please try again.'}
          </p>
        </div>
        <Button
          onClick={handleProcess}
          disabled={isStarting}
          variant="outline"
          className="w-full justify-center border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          aria-label="Retry processing this document"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // ── Processed ─────────────────────────────────────────────────────────────
  const content = record?.extractedContent;
  const processedAt = record?.processedAt
    ? new Date(record.processedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="px-6 py-5 border-t border-gray-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3">
        Document Processing
      </p>

      {/* Success badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-green-800">Processed ✓</p>
          {processedAt && (
            <p className="text-[10px] text-green-600 mt-0.5 truncate">{processedAt}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {content && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Pages', value: content.pageCount },
            { label: 'Words', value: content.wordCount.toLocaleString() },
            { label: 'Chars', value: content.charCount.toLocaleString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="text-base font-bold text-text">{value}</span>
              <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Extracted text preview toggle */}
      {content && content.fullText && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            aria-expanded={isExpanded}
            aria-controls={`extracted-text-${fileId}`}
          >
            <span className="text-xs font-semibold text-text-secondary">Extracted Text Preview</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
            )}
          </button>

          <div
            id={`extracted-text-${fileId}`}
            className={cn(
              'overflow-hidden transition-all duration-200',
              isExpanded ? 'max-h-64' : 'max-h-0',
            )}
          >
            <pre className="p-3 text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words overflow-y-auto max-h-64 font-mono bg-white">
              {content.fullText.slice(0, 1500)}
              {content.fullText.length > 1500 && (
                <span className="text-text-secondary/60 italic">
                  {'\n'}…{content.fullText.length - 1500} more characters
                </span>
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
