// server/routes/profile.js
// GET  /api/profile        — get current user's profile + preferences
// PUT  /api/profile        — update display name / avatar
// PUT  /api/preferences    — update preferences

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfileWithPreferences,
  updateProfile,
  updatePreferences,
} from '../services/profileService.js';

const router = express.Router();

// All routes in this file require authentication
router.use(requireAuth);

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const result = await getProfileWithPreferences(
      req.user.id,
      req.user.email,
    );
    res.json(result);
  } catch (err) {
    console.error('[profile] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const { display_name, avatar_url } = req.body;
    const updated = await updateProfile(req.user.id, { display_name, avatar_url });
    res.json({ profile: updated });
  } catch (err) {
    console.error('[profile] PUT error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/preferences
router.put('/preferences', async (req, res) => {
  try {
    const { theme, default_quiz_count, default_difficulty, show_explanations } = req.body;
    const updated = await updatePreferences(req.user.id, {
      theme,
      default_quiz_count,
      default_difficulty,
      show_explanations,
    });
    res.json({ preferences: updated });
  } catch (err) {
    console.error('[profile] PUT /preferences error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
