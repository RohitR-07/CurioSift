/**
 * ProcessingContext — Module 5 Phase 2
 *
 * Manages the processing lifecycle for uploaded documents.
 * Persists ProcessedDocument records to IndexedDB via localforage.
 * Designed to be consumed by Phase 3 (AI/Study Material generation).
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import localforage from 'localforage';
import { extractContent, ExtractedContent, ExtractionError } from '../services/documentProcessor';
import { useFiles } from './FileContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProcessingStatus = 'idle' | 'processing' | 'processed' | 'error';

export interface ProcessedDocument {
  /** Matches FileRecord.id */
  fileId: string;
  status: ProcessingStatus;
  /** Only populated when status === 'processed' */
  extractedContent?: ExtractedContent;
  processedAt?: number;
  /** Human-readable error message when status === 'error' */
  errorMessage?: string;
}

interface ProcessingContextType {
  /** Map of fileId → ProcessedDocument */
  records: Record<string, ProcessedDocument>;
  isLoaded: boolean;
  getRecord: (fileId: string) => ProcessedDocument | undefined;
  processDocument: (fileId: string) => Promise<void>;
  clearRecord: (fileId: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const processingStore = localforage.createInstance({
  name: 'CurioSift_Processing',
  storeName: 'records',
});

// ─── Context ──────────────────────────────────────────────────────────────────

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const { getFileBlob, getFileById } = useFiles();
  const [records, setRecords] = useState<Record<string, ProcessedDocument>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted processing records on mount
  useEffect(() => {
    const load = async () => {
      try {
        const keys = await processingStore.keys();
        const loaded: Record<string, ProcessedDocument> = {};
        for (const key of keys) {
          const rec = await processingStore.getItem<ProcessedDocument>(key);
          if (rec) {
            // Don't persist 'processing' state across refreshes — reset to idle
            loaded[key] = rec.status === 'processing' ? { ...rec, status: 'idle' } : rec;
          }
        }
        setRecords(loaded);
      } catch (err) {
        console.error('[ProcessingContext] Failed to load records:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const persist = async (doc: ProcessedDocument) => {
    // Don't persist the in-progress state (it would be stale on refresh)
    if (doc.status === 'processing') return;
    try {
      await processingStore.setItem(doc.fileId, doc);
    } catch (err) {
      console.error('[ProcessingContext] Failed to persist record:', err);
    }
  };

  const getRecord = useCallback(
    (fileId: string): ProcessedDocument | undefined => records[fileId],
    [records],
  );

  const processDocument = useCallback(
    async (fileId: string): Promise<void> => {
      const fileRecord = getFileById(fileId);
      if (!fileRecord) {
        throw new Error('File record not found.');
      }

      // Guard: don't start if already processing
      if (records[fileId]?.status === 'processing') return;

      // Optimistic UI: set to processing immediately
      const processingDoc: ProcessedDocument = { fileId, status: 'processing' };
      setRecords((prev) => ({ ...prev, [fileId]: processingDoc }));

      try {
        const blob = await getFileBlob(fileId);
        if (!blob) {
          throw new ExtractionError('File data could not be loaded from storage.');
        }

        const extracted = await extractContent(blob, fileRecord.category, fileRecord.extension);

        if (!extracted.fullText.trim()) {
          throw new ExtractionError(
            'No readable text was found in this document. It may be a scanned image or an empty file.',
          );
        }

        const processed: ProcessedDocument = {
          fileId,
          status: 'processed',
          extractedContent: extracted,
          processedAt: Date.now(),
        };

        setRecords((prev) => ({ ...prev, [fileId]: processed }));
        await persist(processed);
      } catch (err) {
        const errorMessage =
          err instanceof ExtractionError
            ? err.message
            : 'An unexpected error occurred while processing the document.';

        const errorDoc: ProcessedDocument = { fileId, status: 'error', errorMessage };
        setRecords((prev) => ({ ...prev, [fileId]: errorDoc }));
        await persist(errorDoc);
      }
    },
    [records, getFileById, getFileBlob],
  );

  const clearRecord = useCallback(
    async (fileId: string): Promise<void> => {
      setRecords((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
      try {
        await processingStore.removeItem(fileId);
      } catch (err) {
        console.error('[ProcessingContext] Failed to clear record:', err);
      }
    },
    [],
  );

  return (
    <ProcessingContext.Provider value={{ records, isLoaded, getRecord, processDocument, clearRecord }}>
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessing() {
  const ctx = useContext(ProcessingContext);
  if (!ctx) throw new Error('useProcessing must be used within a ProcessingProvider');
  return ctx;
}
