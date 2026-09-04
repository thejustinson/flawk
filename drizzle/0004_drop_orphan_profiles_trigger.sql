-- Not from our schema. A "user profiles" quickstart snippet was run in the
-- Supabase dashboard, adding a trigger on auth.users that inserts into
-- public.profiles — a table that was never created. Every new signup then
-- failed with "Database error saving new user".
--
-- Flawk doesn't use profiles; app code (getOrCreateAccount) creates the
-- accounts row on first Studio visit. Drop the orphaned objects.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.handle_new_user();
