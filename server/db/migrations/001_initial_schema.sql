-- ============================================================
-- StudyMate AI — Module 8: Initial Supabase Schema
-- Run this in your Supabase project's SQL Editor:
-- https://vanlyioziupjibdbkbaa.supabase.co → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
--    Mirrors auth.users; created automatically on first sign-in.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  display_name TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 2. USER_PREFERENCES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme             TEXT NOT NULL DEFAULT 'light'  CHECK (theme IN ('light', 'dark', 'system')),
  default_quiz_count INTEGER NOT NULL DEFAULT 10   CHECK (default_quiz_count IN (5, 10, 15, 20)),
  default_difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (default_difficulty IN ('easy', 'medium', 'hard')),
  show_explanations  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 3. STUDY_SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  document_id    TEXT,          -- localforage file ID (nullable)
  document_name  TEXT,
  session_type   TEXT NOT NULL DEFAULT 'general' CHECK (session_type IN ('general', 'quiz', 'flashcards', 'study')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_created_at ON public.study_sessions(created_at DESC);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 4. QUIZ_ATTEMPTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id      TEXT,          -- localforage file ID (nullable for mock)
  document_name    TEXT,
  topic            TEXT,
  question_type    TEXT CHECK (question_type IN ('mcq', 'true-false', 'mixed')),
  difficulty       TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  total_questions  INTEGER NOT NULL CHECK (total_questions > 0),
  correct_answers  INTEGER NOT NULL CHECK (correct_answers >= 0),
  score_percent    NUMERIC(5,2) NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  source           TEXT NOT NULL DEFAULT 'gemini' CHECK (source IN ('gemini', 'mock')),
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 5. FLASHCARD_PROGRESS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcard_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id     TEXT NOT NULL,      -- localforage file ID used as deck identifier
  card_index  INTEGER NOT NULL,   -- 0-based position within the deck
  status      TEXT NOT NULL DEFAULT 'needs_review' CHECK (status IN ('known', 'needs_review')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, deck_id, card_index)
);

CREATE INDEX idx_flashcard_progress_user_deck ON public.flashcard_progress(user_id, deck_id);

ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own flashcard progress"
  ON public.flashcard_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER flashcard_progress_updated_at
  BEFORE UPDATE ON public.flashcard_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 6. Auto-create profile on user signup
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 7. GRANTS
--    service_role bypasses RLS but still needs table-level GRANT.
--    authenticated role needs GRANT + must pass RLS policies.
-- ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON public.profiles           TO service_role;
GRANT ALL ON public.user_preferences   TO service_role;
GRANT ALL ON public.study_sessions     TO service_role;
GRANT ALL ON public.quiz_attempts      TO service_role;
GRANT ALL ON public.flashcard_progress TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_progress TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
