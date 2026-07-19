-- 1. Enable secure uuid generation
create extension if not exists "uuid-ossp";

-- 2. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create settings table
create table if not exists public.settings (
  user_id uuid references auth.users on delete cascade primary key,
  theme text check (theme in ('light', 'dark')) default 'light',
  dialect text check (dialect in ('north', 'south', 'central')) default 'north',
  speed numeric default 0.8
);

-- 4. Create custom_passages table
create table if not exists public.custom_passages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create session_logs table
create table if not exists public.session_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date timestamp with time zone not null,
  text text not null,
  score integer not null,
  missed_words text[] not null
);

-- 6. Create unlocked_achievements table
create table if not exists public.unlocked_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Enable Row Level Security (RLS) on all tables for security
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.custom_passages enable row level security;
alter table public.session_logs enable row level security;
alter table public.unlocked_achievements enable row level security;

-- Create security policies (Users can only read/write their own records)

-- Profiles policy
create policy "Users can view and edit their own profiles"
  on public.profiles for all
  using (auth.uid() = id);

-- Settings policy
create policy "Users can view and edit their own settings"
  on public.settings for all
  using (auth.uid() = user_id);

-- Custom passages policy
create policy "Users can manage their own passages"
  on public.custom_passages for all
  using (auth.uid() = user_id);

-- Session logs policy
create policy "Users can manage their own session logs"
  on public.session_logs for all
  using (auth.uid() = user_id);

-- Unlocked achievements policy
create policy "Users can manage their own achievements"
  on public.unlocked_achievements for all
  using (auth.uid() = user_id);

-- Setup automatic profile and settings creation on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Bố mẹ'));
  
  insert into public.settings (user_id, theme, dialect, speed)
  values (new.id, 'light', 'north', 0.8);
  
  return new;
end;
$$ language plpgsql security definer;

-- Remove the trigger if it already exists, then re-create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
