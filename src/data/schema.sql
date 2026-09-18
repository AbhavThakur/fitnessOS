-- ==========================================================================
-- IronPulse Multi-Sport Athlete OS — Supabase PostgreSQL Schema
-- Tables for Strength Training, Badminton Matches, Running Sessions, and PRs
-- ==========================================================================

-- 1. Profiles & Athlete Preferences
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  athlete_name TEXT NOT NULL DEFAULT 'Athlete',
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  font_scale TEXT NOT NULL DEFAULT 'large' CHECK (font_scale IN ('normal', 'large', 'extra_large')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Gym Workout Routines & Custom Splits
CREATE TABLE IF NOT EXISTS public.gym_routines (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  profile_id TEXT NOT NULL DEFAULT 'primary',
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_custom BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Logged Gym Workout Sessions
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  profile_id TEXT NOT NULL DEFAULT 'primary',
  routine_id TEXT NOT NULL,
  routine_title TEXT NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  total_sets INTEGER NOT NULL DEFAULT 0,
  total_volume_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  completed_sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  device TEXT NOT NULL DEFAULT 'Amazfit T-Rex 3',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Badminton Matches
CREATE TABLE IF NOT EXISTS public.badminton_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  profile_id TEXT NOT NULL DEFAULT 'primary',
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  sets_won_p1 INTEGER NOT NULL DEFAULT 0,
  sets_won_p2 INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  peak_hr INTEGER NOT NULL DEFAULT 0,
  avg_hr INTEGER NOT NULL DEFAULT 0,
  is_win BOOLEAN NOT NULL DEFAULT false,
  device TEXT NOT NULL DEFAULT 'Amazfit T-Rex 3',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Running Sessions
CREATE TABLE IF NOT EXISTS public.running_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  profile_id TEXT NOT NULL DEFAULT 'primary',
  distance_km NUMERIC(6,2) NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  avg_pace TEXT NOT NULL DEFAULT '5:30',
  avg_hr INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  device TEXT NOT NULL DEFAULT 'Amazfit T-Rex 3',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Personal Records (1RM & Progressive Overload Memory)
CREATE TABLE IF NOT EXISTS public.prs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  profile_id TEXT NOT NULL DEFAULT 'primary',
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm NUMERIC(6,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_exercise UNIQUE (user_id, exercise_id)
);

-- Personal Wearable Sync Configuration (Single-User Athlete Hub)
-- Disable RLS so your watch side-service and web app can read/write freely via Anon Key:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badminton_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prs DISABLE ROW LEVEL SECURITY;

