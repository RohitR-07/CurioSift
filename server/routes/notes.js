// server/routes/notes.js
// POST /api/notes — generate revision notes from document text

import express from 'express';
import { generateRevisionNotes } from '../services/notesService.js';

const router = express.Router();

const HARD_MAX_BYTES = 200_000;

router.post('/', async (req, res) => {
  try {
    const { documentText, documentName, topic = '' } = req.body;

    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return res.status(400).json({ error: 'documentText is required and must be a non-empty string.' });
    }
    if (documentText.length > HARD_MAX_BYTES) {
      return res.status(413).json({ error: `Document text exceeds the ${HARD_MAX_BYTES / 1000} KB limit.` });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Notes generation is unavailable: GEMINI_API_KEY is not configured.' });
    }

    const result = await generateRevisionNotes({
      documentText,
      documentName: documentName || 'Untitled Document',
      topic: typeof topic === 'string' ? topic.trim() : '',
    });

    res.json(result);
  } catch (error) {
    console.error('[notes route] Error:', error);
    const message = error?.message || 'Notes generation failed. Please try again.';
    const status = error?.status;
    const code = error?.code ?? '';

    if (status === 503 || status === 429 || code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED') {
      return res.status(503).json({ error: message });
    }
    if (status === 401 || status === 403) {
      return res.status(503).json({ error: 'AI service authentication failed.' });
    }
    res.status(500).json({ error: message });
  }
});

export default router;
