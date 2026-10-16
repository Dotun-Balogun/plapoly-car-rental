-- Make an existing user an administrator.
--
-- 1. Supabase Dashboard -> Authentication -> Users -> Add user (tick "Auto Confirm User").
-- 2. Replace the email below with that user's email.
-- 3. Run this in Supabase Dashboard -> SQL Editor.
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
