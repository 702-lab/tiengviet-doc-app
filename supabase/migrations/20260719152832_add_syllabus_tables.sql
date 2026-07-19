-- Create public.chapters table
create table if not exists public.chapters (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  order_index integer not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create public.lessons table
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text, -- For future video/audio lectures
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (chapter_id, order_index)
);

-- Create public.exercises table
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title text not null,
  text text not null,
  illustration text, -- Emoji illustration
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (lesson_id, order_index)
);

-- Enable Row Level Security (RLS)
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;

-- Create security policies (Allow public read access for all users)
drop policy if exists "Allow public read access to chapters" on public.chapters;
create policy "Allow public read access to chapters"
  on public.chapters for select
  using (true);

drop policy if exists "Allow public read access to lessons" on public.lessons;
create policy "Allow public read access to lessons"
  on public.lessons for select
  using (true);

drop policy if exists "Allow public read access to exercises" on public.exercises;
create policy "Allow public read access to exercises"
  on public.exercises for select
  using (true);

-- Insert Seed Data (Sách giáo khoa lớp 1)

-- 1. Chapters (Weeks)
insert into public.chapters (id, title, order_index) values
  ('c1000000-0000-0000-0000-000000000001', 'Tuần 1: Làm quen chữ cái 🍎', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Tuần 2: Âm ghép cơ bản 🦉', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Tuần 3: Luyện vần nâng cao 🌟', 3)
on conflict (order_index) do update set title = excluded.title;

-- 2. Lessons (Lessons & future lectures)
insert into public.lessons (id, chapter_id, title, description, order_index) values
  -- Tuần 1
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Bài 1: Âm a, b, c', 'Làm quen âm đầu a, b, c và cách ghép ba, ca', 1),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Bài 2: Âm d, đ, e', 'Làm quen âm d, đ, e và dấu huyền, sắc', 2),
  -- Tuần 2
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Bài 3: Vần ch, nh', 'Luyện phát âm âm ghép ch, nh', 1),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Bài 4: Vần tr, kh', 'Luyện phát âm âm ghép tr, kh', 2),
  -- Tuần 3
  ('a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'Bài 5: Vần am, ap', 'Học vần có âm kết thúc m, p', 1),
  ('a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Bài 6: Vần uông, uôc', 'Học âm đôi uô kết hợp ng, c', 2)
on conflict (chapter_id, order_index) do update set title = excluded.title, description = excluded.description;

-- 3. Exercises (Textbook reading passages)
insert into public.exercises (id, lesson_id, title, text, illustration, order_index) values
  -- Bài 1: Âm a, b, c
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Tập đọc: Ba và bé', 'ba bô. ca ca. ba và bé ca vang.', '👧👨', 1),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Tập đọc: Bé Hà', 'bé hà có ba. bé hà có má. cả nhà yêu bé hà.', '🏡❤️', 2),
  
  -- Bài 2: Âm d, đ, e
  ('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Tập đọc: Bờ đê có đa', 'bờ đê có đa. đa có dê cỏ. đê đa mát rượi.', '🌾🐐', 1),

  -- Bài 3: Vần ch, nh
  ('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Tập đọc: Chợ quê', 'chợ quê có giò. chợ quê có chả. chợ có cả khế đỏ.', '🧺🍋', 1),

  -- Bài 4: Vần tr, kh
  ('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'Tập đọc: Nhà khỉ', 'nhà khỉ ở kề đê. khỉ đi tìm quả. khỉ leo trèo xa.', '🐒🌴', 1),

  -- Bài 5: Vần am, ap
  ('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 'Tập đọc: Xe cam', 'xe chở quả cam đi về bản. cam ngọt lịm ngọt ngào.', '🚛🍊', 1),

  -- Bài 6: Vần uông, uôc
  ('e1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000006', 'Tập đọc: Chú bê vàng', 'chú bê vàng đi ăn cỏ ngoài đê. bê ngoan ngoãn bám mẹ.', '🐂🌾', 1)
on conflict (lesson_id, order_index) do update set title = excluded.title, text = excluded.text, illustration = excluded.illustration;
