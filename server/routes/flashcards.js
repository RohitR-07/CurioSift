// Flashcards Route — server/routes/flashcards.js

/**
 * POST /api/flashcards
 *
 * Accepts:
 *   documentText    string  — extracted text from the document (required)
 *   documentName    string  — file name for logging (optional)
 *   cardCount       number  — number of flashcards to generate (default 10)
 *   topic           string  — optional topic filter
 *
 * Returns:
 *   { cards: Flashcard[], source: 'gemini', generatedAt: number }
 *
 * Errors:
 *   400 — missing / invalid params
 *   413 — document text exceeds hard limit
 *   503 — Gemini not configured
 *   500 — generation failure
 */

import express from 'express';
import { generateFlashcards } from '../services/flashcardService.js';

const router = express.Router();

// Hard cap: 200 KB of plain text is the absolute maximum we accept
const HARD_MAX_TEXT_BYTES = 200_000;

router.post('/', async (req, res) => {
  try {
    const {
      documentText,
      documentName = 'Untitled Document',
      cardCount = 10,
      topic = '',
    } = req.body;

    // Input validation
    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return res.status(400).json({ error: 'documentText is required and must be a non-empty string.' });
    }

    if (documentText.length > HARD_MAX_TEXT_BYTES) {
      return res.status(413).json({
        error: `Document text exceeds the ${HARD_MAX_TEXT_BYTES / 1000} KB limit.`,
      });
    }

    // Validate cardCount: must be a number between 1 and 50, defaults to 10
    const parsedCardCount = Number(cardCount);
    const validCardCount = (!isNaN(parsedCardCount) && parsedCardCount >= 1 && parsedCardCount <= 50)
      ? Math.floor(parsedCardCount)
      : 10;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Flashcard generation unavailable: GEMINI_API_KEY not configured.' });
    }

    const cards = await generateFlashcards({
      documentText,
      documentName,
      cardCount: validCardCount,
      topic: typeof topic === 'string' ? topic.trim() : '',
    });

    if (!cards || cards.cards.length === 0) {
      return res.status(500).json({ error: 'No valid flashcards were generated.' });
    }

    res.json({
      cards: cards.cards,
      source: cards.source,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[flashcards route] Generation error:', error);
    const message = error?.message || 'Flashcard generation failed.';
    if (error?.status === 429 || error?.status === 503) {
      return res.status(503).json({ error: `AI service temporarily unavailable: ${message}` });
    }
    if (error?.status === 401 || error?.status === 403) {
      return res.status(503).json({ error: 'AI service authentication failed.' });
    }
    res.status(500).json({ error: message });
  }
});

export default router;
