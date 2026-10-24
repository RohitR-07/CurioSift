-- ============================================================
-- StudyMate AI — PATCH: Grant table permissions
-- Run this in your Supabase SQL Editor AFTER 001_initial_schema.sql
-- https://supabase.com/dashboard/project/vanlyioziupjbibdkbaa/sql/new
-- ============================================================

-- Grant schema usage to all roles (in case it was missing)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant full access on every StudyMate table to service_role (used by the backend)
-- service_role already bypasses RLS — this just unlocks table-level access
GRANT ALL ON public.profiles          TO service_role;
GRANT ALL ON public.user_preferences  TO service_role;
GRANT ALL ON public.study_sessions    TO service_role;
GRANT ALL ON public.quiz_attempts     TO service_role;
GRANT ALL ON public.flashcard_progress TO service_role;

-- Grant SELECT/INSERT/UPDATE/DELETE to authenticated role (for direct client use)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_progress TO authenticated;

-- Also grant sequence usage (for any serial/sequence columns if present)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
