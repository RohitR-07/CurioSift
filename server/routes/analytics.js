// server/routes/analytics.js
// GET /api/analytics — aggregate study statistics for the Analytics page

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAnalyticsStats } from '../services/quizAttemptService.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const stats = await getAnalyticsStats(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('[analytics] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
