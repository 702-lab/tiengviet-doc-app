-- Grant select permissions on chapters, lessons, and exercises to anon and authenticated roles
grant select on table public.chapters to anon, authenticated;
grant select on table public.lessons to anon, authenticated;
grant select on table public.exercises to anon, authenticated;
