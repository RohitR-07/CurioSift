/**
 * StudyMaterialPanel — Module 5 Phase 3
 *
 * This acts as the entry point from the FileViewerPage sidebar into the
 * full-screen Study Material Workspace.
 */

import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useProcessing } from '../../context/ProcessingContext';

interface StudyMaterialPanelProps {
  fileId: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 flex items-center gap-1.5">
      <BrainCircuit className="w-3.5 h-3.5 text-primary" />
      {children}
    </p>
  );
}

export function StudyMaterialPanel({ fileId }: StudyMaterialPanelProps) {
  const { getRecord } = useProcessing();
  const navigate = useNavigate();

  const processingRecord = getRecord(fileId);
  const isProcessed = processingRecord?.status === 'processed';
  const isStillProcessing = processingRecord?.status === 'processing';

  // ── Not yet processed ──────────────────────────────────────────────────────
  if (!processingRecord || processingRecord.status === 'idle') {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <SectionTitle>Study Material</SectionTitle>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-text-secondary">
          <BrainCircuit className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <p className="text-xs leading-relaxed">
            Process this document first to enable study material generation.
          </p>
        </div>
      </div>
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (isStillProcessing) {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <SectionTitle>Study Material</SectionTitle>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <p className="text-xs text-blue-600 font-medium">Processing document…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (processingRecord.status === 'error') {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <SectionTitle>Study Material</SectionTitle>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">
            Document processing failed. Retry processing to enable generation.
          </p>
        </div>
      </div>
    );
  }

  // ── Processed ──────────────────────────────────────────────────────────────
  if (isProcessed) {
    return (
      <div className="px-6 py-5 border-t border-gray-100">
        <SectionTitle>Study Material</SectionTitle>
        
        <div className="flex flex-col items-center gap-4 text-center p-5 rounded-2xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-blue-100">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-text mb-1">Document Ready</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Create AI-powered summaries, notes, and MCQs in the study workspace.
            </p>
          </div>

          <Button 
            className="w-full justify-center shadow-md shadow-primary/10"
            onClick={() => navigate(`/study/${fileId}`)}
          >
            <BrainCircuit className="w-4 h-4 mr-2" />
            Open Workspace
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
