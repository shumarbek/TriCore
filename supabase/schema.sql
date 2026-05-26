-- ============================================
-- TriCore Platform — Supabase Database Schema
-- ============================================

-- 1. PROFILES (auth.users bilan bog'liq)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  username text unique not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'banned')),
  is_online boolean not null default false,
  xp integer not null default 0,
  streak integer not null default 0,
  level integer not null default 1,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auth trigger: yangi user ro'yxatdan o'tganda profiles ga insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. LESSON PROGRESS
create table if not exists public.lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text not null,
  subject_id text not null,
  section_id text not null,
  sub_section_id text not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- 3. EXAM QUESTIONS (admin bank)
create table if not exists public.exam_questions (
  id uuid default gen_random_uuid() primary key,
  subject_id text not null,
  section_id text not null,
  sub_section_id text not null,
  question text not null,
  options jsonb not null default '[]',
  correct_index integer not null default 0,
  explanation text not null default '',
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. EXAM RESULTS
create table if not exists public.exam_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  section_id text not null,
  sub_section_id text not null,
  score integer not null default 0 check (score between 0 and 100),
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  time_spent integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. MESSAGES (user <-> admin)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open', 'replied', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- 6. NOTES (user shaxsiy qaydlari)
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text not null default '',
  subject text,
  lesson_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. AI CONFIG (admin sozlamalari)
create table if not exists public.ai_config (
  id uuid default gen_random_uuid() primary key,
  api_key text not null default '',
  model text not null default 'gpt-4o-mini',
  platform_context text not null default '',
  updated_by uuid references public.profiles(id) not null,
  updated_at timestamptz not null default now()
);

-- 8. AI USAGE LOG
create table if not exists public.ai_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tokens_used integer not null default 0,
  created_at timestamptz not null default now()
);

-- 9. DAILY ACTIVITY
create table if not exists public.daily_activity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  lessons_completed integer not null default 0,
  exams_taken integer not null default 0,
  ai_requests integer not null default 0,
  time_spent_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_results enable row level security;
alter table public.messages enable row level security;
alter table public.notes enable row level security;
alter table public.ai_config enable row level security;
alter table public.ai_usage enable row level security;
alter table public.daily_activity enable row level security;

-- Helper: admin mi?
create or replace function public.is_admin()
returns boolean as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- PROFILES
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admin can update any profile" on public.profiles for update using (public.is_admin());
create policy "Admin can delete any profile" on public.profiles for delete using (public.is_admin());

-- LESSON PROGRESS
create policy "Users view own progress" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "Users update own progress" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users modify own progress" on public.lesson_progress for update using (auth.uid() = user_id);
create policy "Admin views all progress" on public.lesson_progress for select using (public.is_admin());

-- EXAM QUESTIONS
create policy "Anyone can view questions" on public.exam_questions for select using (true);
create policy "Admin can insert questions" on public.exam_questions for insert with check (public.is_admin());
create policy "Admin can update questions" on public.exam_questions for update using (public.is_admin());
create policy "Admin can delete questions" on public.exam_questions for delete using (public.is_admin());

-- EXAM RESULTS
create policy "Users view own results" on public.exam_results for select using (auth.uid() = user_id);
create policy "Users insert own results" on public.exam_results for insert with check (auth.uid() = user_id);
create policy "Admin views all results" on public.exam_results for select using (public.is_admin());

-- MESSAGES
create policy "Users view own messages" on public.messages for select using (auth.uid() = user_id);
create policy "Users send messages" on public.messages for insert with check (auth.uid() = user_id);
create policy "Admin views all messages" on public.messages for select using (public.is_admin());
create policy "Admin replies to messages" on public.messages for update using (public.is_admin());

-- NOTES
create policy "Users view own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users create own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users update own notes" on public.notes for update using (auth.uid() = user_id);
create policy "Users delete own notes" on public.notes for delete using (auth.uid() = user_id);

-- AI CONFIG
create policy "Anyone can view ai config" on public.ai_config for select using (true);
create policy "Admin can manage ai config" on public.ai_config for all using (public.is_admin());

-- AI USAGE
create policy "Users insert own usage" on public.ai_usage for insert with check (auth.uid() = user_id);
create policy "Admin views all usage" on public.ai_usage for select using (public.is_admin());

-- DAILY ACTIVITY
create policy "Users view own activity" on public.daily_activity for select using (auth.uid() = user_id);
create policy "Users upsert own activity" on public.daily_activity for insert with check (auth.uid() = user_id);
create policy "Users update own activity" on public.daily_activity for update using (auth.uid() = user_id);
create policy "Admin views all activity" on public.daily_activity for select using (public.is_admin());

-- ============================================
-- REALTIME (online status, messages)
-- ============================================
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.messages;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id);
create index if not exists idx_lesson_progress_lesson on public.lesson_progress(lesson_id);
create index if not exists idx_exam_questions_scope on public.exam_questions(subject_id, section_id, sub_section_id);
create index if not exists idx_exam_results_user on public.exam_results(user_id);
create index if not exists idx_messages_user on public.messages(user_id);
create index if not exists idx_messages_status on public.messages(status);
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_daily_activity_user_date on public.daily_activity(user_id, date);
create index if not exists idx_profiles_xp on public.profiles(xp desc);
create index if not exists idx_profiles_role on public.profiles(role);
