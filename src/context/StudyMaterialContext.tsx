/**
 * StudyMaterialContext — Module 5 Phase 3
 *
 * Manages study material generation lifecycle.
 * Persists study materials to IndexedDB via localforage.
 * Consumes ExtractedContent from ProcessingContext (Phase 2).
 *
 * Designed for Phase 4 integration — all API surface is stable.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import localforage from 'localforage';
import { useProcessing } from './ProcessingContext';
import { generateStudyMaterial } from '../services/studyMaterialGenerator';
import type {
  StudyMaterial,
  GenerationConfig,
} from '../types/studyMaterial';

// ─── Store ────────────────────────────────────────────────────────────────────

const studyMaterialStore = localforage.createInstance({
  name: 'StudyMateAI',
  storeName: 'study_material_store',
});

// ─── Context Type ─────────────────────────────────────────────────────────────

interface StudyMaterialContextType {
  /** All persisted study materials, keyed by StudyMaterial.id */
  materials: Record<string, StudyMaterial>;
  isLoaded: boolean;
  /** Returns all materials for a given fileId */
  getMaterialsForFile: (fileId: string) => StudyMaterial[];
  /** Returns the latest material for a fileId + config type combo */
  getLatestMaterial: (fileId: string, type: GenerationConfig['type']) => StudyMaterial | undefined;
  /** Trigger generation and persist result */
  generate: (fileId: string, config: GenerationConfig) => Promise<string | null>;
  /** Delete a single study material */
  deleteMaterial: (id: string) => Promise<void>;
  /** Clear all materials for a fileId (e.g. when file is deleted) */
  clearMaterialsForFile: (fileId: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StudyMaterialContext = createContext<StudyMaterialContextType | undefined>(undefined);

export function StudyMaterialProvider({ children }: { children: ReactNode }) {
  const { getRecord } = useProcessing();
  const [materials, setMaterials] = useState<Record<string, StudyMaterial>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted materials on mount
  useEffect(() => {
    const load = async () => {
      try {
        const keys = await studyMaterialStore.keys();
        const loaded: Record<string, StudyMaterial> = {};
        for (const key of keys) {
          const mat = await studyMaterialStore.getItem<StudyMaterial>(key);
          if (mat) {
            // Reset any stale 'generating' state from a previous session
            loaded[key] =
              mat.status === 'generating'
                ? { ...mat, status: 'error', errorMessage: 'Generation was interrupted.' }
                : mat;
          }
        }
        setMaterials(loaded);
      } catch (err) {
        console.error('[StudyMaterialContext] Failed to load materials:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const persist = async (mat: StudyMaterial) => {
    try {
      await studyMaterialStore.setItem(mat.id, mat);
    } catch (err) {
      console.error('[StudyMaterialContext] Failed to persist material:', err);
    }
  };

  const getMaterialsForFile = useCallback(
    (fileId: string): StudyMaterial[] =>
      Object.values(materials).filter((m) => m.fileId === fileId),
    [materials],
  );

  const getLatestMaterial = useCallback(
    (fileId: string, type: GenerationConfig['type']): StudyMaterial | undefined =>
      Object.values(materials)
        .filter((m) => m.fileId === fileId && m.config.type === type && m.status === 'generated')
        .sort((a, b) => b.createdAt - a.createdAt)[0],
    [materials],
  );

  const generate = useCallback(
    async (fileId: string, config: GenerationConfig): Promise<string | null> => {
      const processingRecord = getRecord(fileId);
      if (!processingRecord || processingRecord.status !== 'processed') {
        throw new Error('Document must be processed before generating study materials.');
      }

      const extractedContent = processingRecord.extractedContent;
      if (!extractedContent || !extractedContent.fullText.trim()) {
        throw new Error('No extracted content available. Please re-process the document.');
      }

      // Create a new material record
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const now = Date.now();
      const pending: StudyMaterial = {
        id,
        fileId,
        config,
        status: 'generating',
        createdAt: now,
        updatedAt: now,
      };

      setMaterials((prev) => ({ ...prev, [id]: pending }));

      try {
        const content = await generateStudyMaterial(extractedContent, config);

        const done: StudyMaterial = {
          ...pending,
          status: 'generated',
          content,
          updatedAt: Date.now(),
        };

        setMaterials((prev) => ({ ...prev, [id]: done }));
        await persist(done);
        return id;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Generation failed. Please try again.';

        const failed: StudyMaterial = {
          ...pending,
          status: 'error',
          errorMessage,
          updatedAt: Date.now(),
        };

        setMaterials((prev) => ({ ...prev, [id]: failed }));
        await persist(failed);
        return null;
      }
    },
    [getRecord],
  );

  const deleteMaterial = useCallback(async (id: string) => {
    setMaterials((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await studyMaterialStore.removeItem(id);
    } catch (err) {
      console.error('[StudyMaterialContext] Failed to delete material:', err);
    }
  }, []);

  const clearMaterialsForFile = useCallback(
    async (fileId: string) => {
      const ids = Object.values(materials)
        .filter((m) => m.fileId === fileId)
        .map((m) => m.id);

      setMaterials((prev) => {
        const next = { ...prev };
        ids.forEach((id) => delete next[id]);
        return next;
      });

      await Promise.all(
        ids.map((id) => studyMaterialStore.removeItem(id).catch(console.error)),
      );
    },
    [materials],
  );

  return (
    <StudyMaterialContext.Provider
      value={{
        materials,
        isLoaded,
        getMaterialsForFile,
        getLatestMaterial,
        generate,
        deleteMaterial,
        clearMaterialsForFile,
      }}
    >
      {children}
    </StudyMaterialContext.Provider>
  );
}

export function useStudyMaterial() {
  const ctx = useContext(StudyMaterialContext);
  if (!ctx) throw new Error('useStudyMaterial must be used within a StudyMaterialProvider');
  return ctx;
}
