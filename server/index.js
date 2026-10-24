import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import quizRoutes from './routes/quiz.js';
import flashcardsRoutes from './routes/flashcards.js';
import notesRoutes from './routes/notes.js';
import profileRoutes from './routes/profile.js';
import quizAttemptsRoutes from './routes/quizAttempts.js';
import flashcardProgressRoutes from './routes/flashcardProgress.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// AI Generation Routes
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/notes', notesRoutes);

// Database / Auth Routes (Module 8)
app.use('/api/profile', profileRoutes);
app.use('/api/quiz-attempts', quizAttemptsRoutes);
app.use('/api/flashcard-progress', flashcardProgressRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'StudyMate AI Backend is running.',
    db: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[server] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. ' +
      'Database features (quiz history, flashcard progress, profiles) will return 503.'
    );
  }
});
