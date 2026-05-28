create table if not exists public.lesson_content (
  id uuid default gen_random_uuid() primary key,
  lesson_id text not null unique,
  title text not null,
  subject_id text not null default '',
  subject_name text not null default '',
  section_id text not null default '',
  section_name text not null default '',
  sub_section_id text not null default '',
  sub_section_name text not null default '',
  order_index integer not null default 999,
  video_url text not null default '',
  handbook_rules text not null default '',
  handbook_terms text not null default '',
  formulas text not null default '',
  mini_exam_count integer not null default 10,
  homework_pdf text not null default '',
  homework_deadline text not null default '',
  updated_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_content add column if not exists subject_id text not null default '';
alter table public.lesson_content add column if not exists subject_name text not null default '';
alter table public.lesson_content add column if not exists section_id text not null default '';
alter table public.lesson_content add column if not exists section_name text not null default '';
alter table public.lesson_content add column if not exists sub_section_id text not null default '';
alter table public.lesson_content add column if not exists sub_section_name text not null default '';
alter table public.lesson_content add column if not exists order_index integer not null default 999;

alter table public.lesson_content enable row level security;

drop policy if exists "Anyone can view lesson content" on public.lesson_content;
drop policy if exists "Admin can insert lesson content" on public.lesson_content;
drop policy if exists "Admin can update lesson content" on public.lesson_content;
drop policy if exists "Admin can delete lesson content" on public.lesson_content;

create policy "Anyone can view lesson content"
on public.lesson_content
for select
using (true);

create policy "Admin can insert lesson content"
on public.lesson_content
for insert
with check (public.is_admin());

create policy "Admin can update lesson content"
on public.lesson_content
for update
using (public.is_admin());

create policy "Admin can delete lesson content"
on public.lesson_content
for delete
using (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'lesson_content'
  ) then
    alter publication supabase_realtime add table public.lesson_content;
  end if;
end $$;

create index if not exists idx_lesson_content_lesson on public.lesson_content(lesson_id);
create index if not exists idx_lesson_content_scope
on public.lesson_content(subject_id, section_id, sub_section_id);
