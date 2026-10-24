/**
 * Quiz Route — server/routes/quiz.js
 *
 * POST /api/quiz
 *
 * Accepts:
 *   documentText    string  — extracted text from the document (required)
 *   documentName    string  — file name for logging (required)
 *   questionCount   number  — 5 | 10 | 15 | 20 (required)
 *   questionType    string  — 'mcq' | 'true-false' | 'mixed' (required)
 *   difficulty      string  — 'easy' | 'medium' | 'hard' (required)
 *   topic           string  — optional topic/chapter filter
 *   showExplanations boolean — optional, forwarded to questions
 *
 * Returns:
 *   { questions: QuizQuestion[], source: 'gemini', generatedAt: number }
 *
 * Errors:
 *   400 — missing / invalid params
 *   413 — document text exceeds hard limit
 *   503 — Gemini not configured
 *   500 — generation failure
 */

import express from 'express';
import { generateAIQuiz } from '../services/quizService.js';

const router = express.Router();

// Hard cap: 200 KB of plain text is the absolute maximum we accept
const HARD_MAX_TEXT_BYTES = 200_000;

const VALID_COUNTS    = new Set([5, 10, 15, 20]);
const VALID_TYPES     = new Set(['mcq', 'true-false', 'mixed']);
const VALID_DIFFICULT = new Set(['easy', 'medium', 'hard']);

router.post('/', async (req, res) => {
  try {
    const {
      documentText,
      documentName,
      questionCount,
      questionType,
      difficulty,
      topic = '',
      showExplanations = true,
    } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────

    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return res.status(400).json({
        error: 'documentText is required and must be a non-empty string.',
      });
    }

    if (documentText.length > HARD_MAX_TEXT_BYTES) {
      return res.status(413).json({
        error: `Document text exceeds the ${HARD_MAX_TEXT_BYTES / 1000} KB limit. The service will automatically truncate large documents — please re-send.`,
      });
    }

    if (!VALID_COUNTS.has(Number(questionCount))) {
      return res.status(400).json({
        error: `questionCount must be one of: ${[...VALID_COUNTS].join(', ')}.`,
      });
    }

    if (!VALID_TYPES.has(questionType)) {
      return res.status(400).json({
        error: `questionType must be one of: ${[...VALID_TYPES].join(', ')}.`,
      });
    }

    if (!VALID_DIFFICULT.has(difficulty)) {
      return res.status(400).json({
        error: `difficulty must be one of: ${[...VALID_DIFFICULT].join(', ')}.`,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Quiz generation is unavailable: GEMINI_API_KEY is not configured on the server.',
      });
    }

    // ── Generation ────────────────────────────────────────────────────────────

    const questions = await generateAIQuiz({
      documentText,
      documentName: documentName || 'Untitled Document',
      questionCount: Number(questionCount),
      questionType,
      difficulty,
      topic: typeof topic === 'string' ? topic.trim() : '',
      showExplanations: Boolean(showExplanations),
    });

    if (!questions || questions.length === 0) {
      return res.status(500).json({
        error: 'No valid questions were generated. The document may have insufficient relevant content.',
      });
    }

    res.json({
      questions,
      source: 'gemini',
      generatedAt: Date.now(),
    });

  } catch (error) {
    console.error('[quiz route] Generation error:', error);

    const message = error?.message || 'Quiz generation failed. Please try again.';
    const status  = error?.status;
    const code    = error?.code ?? '';

    // Overload / rate-limit — includes friendly wrapped errors from callGemini
    if (status === 503 || status === 429 ||
        code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED') {
      return res.status(503).json({ error: message });
    }

    // Auth errors
    if (status === 401 || status === 403) {
      return res.status(503).json({ error: 'AI service authentication failed. Please contact support.' });
    }

    res.status(500).json({ error: message });
  }
});

export default router;
