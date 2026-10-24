// server/routes/quizAttempts.js
// POST /api/quiz-attempts       — save a completed quiz attempt
// GET  /api/quiz-attempts       — list user's quiz history
// GET  /api/quiz-attempts/stats — get aggregate stats

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  saveQuizAttempt,
  getQuizAttempts,
  getQuizStats,
} from '../services/quizAttemptService.js';

const router = express.Router();
router.use(requireAuth);

// POST /api/quiz-attempts
router.post('/', async (req, res) => {
  const {
    documentId,
    documentName,
    topic,
    questionType,
    difficulty,
    totalQuestions,
    correctAnswers,
    scorePercent,
    source,
  } = req.body;

  // Validate required fields
  if (typeof totalQuestions !== 'number' || totalQuestions < 1) {
    return res.status(400).json({ error: 'totalQuestions must be a positive number.' });
  }
  if (typeof correctAnswers !== 'number' || correctAnswers < 0) {
    return res.status(400).json({ error: 'correctAnswers must be a non-negative number.' });
  }
  if (typeof scorePercent !== 'number' || scorePercent < 0 || scorePercent > 100) {
    return res.status(400).json({ error: 'scorePercent must be between 0 and 100.' });
  }

  try {
    const row = await saveQuizAttempt(req.user.id, {
      documentId, documentName, topic, questionType, difficulty,
      totalQuestions, correctAnswers, scorePercent, source,
    });
    res.status(201).json({ attempt: row });
  } catch (err) {
    console.error('[quiz-attempts] POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz-attempts/stats  — must be before /:id patterns
router.get('/stats', async (req, res) => {
  try {
    const stats = await getQuizStats(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('[quiz-attempts] GET /stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz-attempts
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    const attempts = await getQuizAttempts(req.user.id, limit);
    res.json({ attempts });
  } catch (err) {
    console.error('[quiz-attempts] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
