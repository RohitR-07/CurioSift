/**
 * AI Quiz Generator Service — Module 7, Phase 2
 *
 * Calls the backend /api/quiz endpoint with extracted document text.
 * Falls back to mock generation ONLY on network errors (server unreachable),
 * never silently when the server IS reachable but returns an error.
 *
 * The frontend never sends the API key — it's held server-side only.
 */

import type { QuizConfig, GeneratedQuizSession, QuizQuestion } from '../types/quiz';
import type { ExtractedContent } from './documentProcessor';
import { generateMockQuiz } from './mockQuizGenerator';

// ─── API call ─────────────────────────────────────────────────────────────────

const QUIZ_API_URL = '/api/quiz';

/**
 * Custom error that carries a `usedFallback` flag so the page can show
 * a clear notice when it fell back to mock generation.
 */
export class QuizGenerationError extends Error {
  constructor(
    message: string,
    public readonly usedFallback: boolean = false,
  ) {
    super(message);
    this.name = 'QuizGenerationError';
  }
}

interface APIQuizResponse {
  questions: QuizQuestion[];
  source: 'gemini';
  generatedAt: number;
}

async function callQuizAPI(
  config: QuizConfig,
  extractedContent: ExtractedContent,
  documentName: string,
): Promise<APIQuizResponse> {
  const response = await fetch(QUIZ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentText:   extractedContent.fullText,
      documentName,
      questionCount:  config.questionCount,
      questionType:   config.questionType,
      difficulty:     config.difficulty,
      topic:          config.topic,
      showExplanations: config.showExplanations,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Quiz generation failed (HTTP ${response.status}).`;
    try {
      const body = await response.json();
      if (body?.error) errorMessage = body.error;
    } catch {
      // Non-JSON response — use status-based message
    }
    throw new QuizGenerationError(errorMessage, false);
  }

  return response.json() as Promise<APIQuizResponse>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a quiz session using Gemini AI via the backend.
 *
 * Strategy:
 *  1. Try calling the /api/quiz backend (Gemini-powered).
 *  2. If the server is unreachable (network error / fetch failed), fall back to
 *     the static mock generator and mark `source: 'mock'` with a clear notice.
 *  3. If the server IS reachable but returns an error, propagate that error —
 *     never silently present mock questions as AI-generated.
 *
 * @param config           The quiz configuration from the UI
 * @param extractedContent The document's extracted text from ProcessingContext
 * @param documentName     Human-readable file name for logging
 */
export async function generateAIQuizSession(
  config: QuizConfig,
  extractedContent: ExtractedContent,
  documentName: string,
): Promise<GeneratedQuizSession> {
  const sessionId =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    const apiResult = await callQuizAPI(config, extractedContent, documentName);

    return {
      sessionId,
      config,
      questions: apiResult.questions,
      source: 'gemini',
      generatedAt: apiResult.generatedAt,
    };
  } catch (err) {
    // Network-level failure (server unreachable) → silent mock fallback
    const isFetchError =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));

    if (isFetchError) {
      console.warn(
        '[aiQuizGenerator] Backend unreachable — falling back to mock generation.',
        err,
      );
      const mockSession = await generateMockQuiz(config);
      return {
        ...mockSession,
        sessionId,
        // Override source to clearly indicate this is a fallback
        source: 'mock',
      };
    }

    // Server returned an error — propagate it; do not silently use mock
    throw err;
  }
}
