// server/routes/flashcardProgress.js
// POST /api/flashcard-progress              — upsert a single card's status
// POST /api/flashcard-progress/bulk         — upsert multiple cards at once
// GET  /api/flashcard-progress/:deckId      — get all card progress for a deck

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  saveCardStatus,
  saveMultipleCardStatuses,
  getDeckProgress,
} from '../services/flashcardProgressService.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/flashcard-progress
router.post('/', async (req, res) => {
  const { deckId, cardIndex, status } = req.body;

  if (!deckId || typeof deckId !== 'string') {
    return res.status(400).json({ error: 'deckId is required.' });
  }
  if (typeof cardIndex !== 'number' || cardIndex < 0) {
    return res.status(400).json({ error: 'cardIndex must be a non-negative number.' });
  }
  if (!['known', 'needs_review'].includes(status)) {
    return res.status(400).json({ error: "status must be 'known' or 'needs_review'." });
  }

  try {
    const row = await saveCardStatus(req.user.id, deckId, cardIndex, status);
    res.status(201).json({ progress: row });
  } catch (err) {
    console.error('[flashcard-progress] POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/flashcard-progress/bulk
router.post('/bulk', async (req, res) => {
  const { deckId, cards } = req.body;

  if (!deckId || typeof deckId !== 'string') {
    return res.status(400).json({ error: 'deckId is required.' });
  }
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'cards must be a non-empty array.' });
  }

  try {
    const rows = await saveMultipleCardStatuses(req.user.id, deckId, cards);
    res.status(201).json({ count: rows.length });
  } catch (err) {
    console.error('[flashcard-progress] POST /bulk error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flashcard-progress/:deckId
router.get('/:deckId', async (req, res) => {
  const { deckId } = req.params;
  if (!deckId) {
    return res.status(400).json({ error: 'deckId is required.' });
  }

  try {
    const progress = await getDeckProgress(req.user.id, deckId);
    res.json({ deckId, progress });
  } catch (err) {
    console.error('[flashcard-progress] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
