-- ==========================================================================
-- Run this in Supabase SQL Editor to allow Amazfit T-Rex 3 automatic sync
-- ==========================================================================

-- Option 1 (Recommended for Personal Single-User Project):
-- Disable RLS so your watch and dashboard can sync freely via Anon API key:
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badminton_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_routines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled, uncomment the policies below instead:
-- CREATE POLICY "Allow anon all on workout_logs" ON public.workout_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon all on badminton_matches" ON public.badminton_matches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon all on running_sessions" ON public.running_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon all on gym_routines" ON public.gym_routines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon all on prs" ON public.prs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon all on profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
