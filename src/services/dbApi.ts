// src/services/dbApi.ts
// Frontend API helpers for database-backed routes.
// All calls include the Supabase JWT in the Authorization header via getAuthHeader().

import type { QuizResult } from '../types/quiz';

// ─────────────────────────────────────────────────────────────
// Quiz Attempts
// ─────────────────────────────────────────────────────────────

interface SaveAttemptOptions {
  result: QuizResult;
  documentId?: string;
  documentName?: string;
  getAuthHeader: () => Promise<Record<string, string>>;
}

/**
 * Saves a completed quiz attempt to the backend.
 * Only saves when result.session.source === 'gemini' — mock data is not persisted.
 * Returns { saved: true } on success, { saved: false, reason } when skipped or failed.
 */
export async function saveQuizAttempt({ result, documentId, documentName, getAuthHeader }: SaveAttemptOptions): Promise<{ saved: boolean; reason?: string }> {
  if (result.session.source !== 'gemini') {
    return { saved: false, reason: 'mock data — not persisted' };
  }

  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) {
      return { saved: false, reason: 'not authenticated' };
    }

    const res = await fetch('/api/quiz-attempts', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        documentName,
        topic: result.session.config.topic || null,
        questionType: result.session.config.questionType,
        difficulty: result.session.config.difficulty,
        totalQuestions: result.total,
        correctAnswers: result.score,
        scorePercent: result.percentage,
        source: result.session.source,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const reason = data.error ?? `HTTP ${res.status}`;
      console.warn('[saveQuizAttempt] failed:', reason, data);
      return { saved: false, reason };
    }

    return { saved: true };
  } catch (err: any) {
    console.warn('[saveQuizAttempt] network error:', err?.message);
    return { saved: false, reason: err?.message ?? 'Network error' };
  }
}

/**
 * Fetch the user's recent quiz attempts.
 */
export async function getQuizAttempts(
  getAuthHeader: () => Promise<Record<string, string>>,
  limit = 10
): Promise<{ attempts: any[]; error?: string }> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return { attempts: [], error: 'not authenticated' };

    const res = await fetch(`/api/quiz-attempts?limit=${limit}`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { attempts: [], error: data.error ?? `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { attempts: data.attempts ?? [] };
  } catch (err: any) {
    return { attempts: [], error: err?.message ?? 'Network error' };
  }
}

// ─────────────────────────────────────────────────────────────
// Flashcard Progress
// ─────────────────────────────────────────────────────────────

interface SaveCardOptions {
  deckId: string;
  cardIndex: number;
  status: 'known' | 'needs_review';
  getAuthHeader: () => Promise<Record<string, string>>;
}

/**
 * Upserts a single card's status. Fire-and-forget friendly (errors are returned, not thrown).
 */
export async function saveFlashcardStatus({ deckId, cardIndex, status, getAuthHeader }: SaveCardOptions): Promise<{ saved: boolean; reason?: string }> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return { saved: false, reason: 'not authenticated' };

    const res = await fetch('/api/flashcard-progress', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId, cardIndex, status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { saved: false, reason: data.error ?? `HTTP ${res.status}` };
    }
    return { saved: true };
  } catch (err: any) {
    return { saved: false, reason: err?.message ?? 'Network error' };
  }
}

/**
 * Fetches all card progress for a deck and returns a Set of card indices that are 'known'.
 */
export async function getFlashcardProgress(
  deckId: string,
  getAuthHeader: () => Promise<Record<string, string>>
): Promise<{ knownIndices: Set<number>; error?: string }> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return { knownIndices: new Set(), error: 'not authenticated' };

    const res = await fetch(`/api/flashcard-progress/${encodeURIComponent(deckId)}`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { knownIndices: new Set(), error: data.error ?? `HTTP ${res.status}` };
    }

    const data = await res.json();
    const knownIndices = new Set<number>();
    const progress: Record<string, string> = data.progress ?? {};
    for (const [idx, status] of Object.entries(progress)) {
      if (status === 'known') knownIndices.add(Number(idx));
    }
    return { knownIndices };
  } catch (err: any) {
    return { knownIndices: new Set(), error: err?.message ?? 'Network error' };
  }
}

// ─────────────────────────────────────────────────────────────
// Quiz Stats (for Dashboard)
// ─────────────────────────────────────────────────────────────

export async function getQuizStats(
  getAuthHeader: () => Promise<Record<string, string>>
): Promise<{ totalAttempts: number; aiAttempts: number; avgScore: number; error?: string }> {
  const empty = { totalAttempts: 0, aiAttempts: 0, avgScore: 0 };
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return { ...empty, error: 'not authenticated' };

    const res = await fetch('/api/quiz-attempts/stats', { headers });
    if (!res.ok) return { ...empty, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ...empty, error: err?.message };
  }
}

// ─────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────

export interface ScoreBucket { label: string; count: number; }
export interface DifficultyStats { count: number; avgScore: number; }
export interface DocumentStat { name: string; count: number; avgScore: number; }

export interface AnalyticsData {
  totalAttempts: number;
  avgScore: number;
  bestScore: number;
  recentAttempts: any[];
  byDifficulty: Record<string, DifficultyStats>;
  byDocument: DocumentStat[];
  scoreDistribution: ScoreBucket[];
  error?: string;
}

const emptyAnalytics: AnalyticsData = {
  totalAttempts: 0, avgScore: 0, bestScore: 0,
  recentAttempts: [], byDifficulty: {}, byDocument: [], scoreDistribution: [],
};

export async function getAnalytics(
  getAuthHeader: () => Promise<Record<string, string>>
): Promise<AnalyticsData> {
  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) return { ...emptyAnalytics, error: 'not authenticated' };
    const res = await fetch('/api/analytics', { headers });
    if (!res.ok) return { ...emptyAnalytics, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err: any) {
    return { ...emptyAnalytics, error: err?.message };
  }
}

