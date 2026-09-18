-- ==========================================================================
-- IronPulse Multi-Profile Migration (Husband & Wife Dual-Watch Support)
-- Run this in Supabase SQL Editor to add profile_id to all tables
-- ==========================================================================

-- 1. Add profile_id column (defaults to 'primary')
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE public.badminton_matches ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE public.running_sessions ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE public.gym_routines ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'primary';
ALTER TABLE public.prs ADD COLUMN IF NOT EXISTS profile_id TEXT NOT NULL DEFAULT 'primary';

-- 2. Add athlete profiles table entries
INSERT INTO public.profiles (athlete_name, weight_unit, font_scale)
VALUES 
  ('You (T-Rex 3)', 'kg', 'large'),
  ('Wife (Amazfit)', 'kg', 'large')
ON CONFLICT DO NOTHING;

-- 3. Confirm RLS disabled for smooth multi-watch sync via Anon Key
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badminton_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
