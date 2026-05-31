create table if not exists public.practice_exam_guard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  guard_date date not null,
  cheat_attempts integer not null default 0,
  blocked_until timestamptz,
  last_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, guard_date)
);

alter table public.practice_exam_guard enable row level security;

create policy "Users view own practice exam guard"
on public.practice_exam_guard
for select
using (auth.uid() = user_id);

create policy "Users insert own practice exam guard"
on public.practice_exam_guard
for insert
with check (auth.uid() = user_id);

create policy "Users update own practice exam guard"
on public.practice_exam_guard
for update
using (auth.uid() = user_id);

create policy "Admin views all practice exam guard"
on public.practice_exam_guard
for select
using (public.is_admin());

create index if not exists idx_practice_exam_guard_user
on public.practice_exam_guard(user_id, guard_date);
