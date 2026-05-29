create table if not exists public.curriculum_structure (
  id uuid default gen_random_uuid() primary key,
  node_id text not null,
  node_type text not null check (node_type in ('section', 'sub_section')),
  subject_id text not null,
  parent_section_id text not null default '',
  name text not null,
  order_index integer not null default 999,
  is_deleted boolean not null default false,
  updated_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.curriculum_structure add column if not exists parent_section_id text not null default '';
update public.curriculum_structure set parent_section_id = '' where parent_section_id is null;

create unique index if not exists idx_curriculum_structure_unique
on public.curriculum_structure(node_type, subject_id, node_id, parent_section_id);

alter table public.curriculum_structure enable row level security;

drop policy if exists "Anyone can view curriculum structure" on public.curriculum_structure;
drop policy if exists "Admin can insert curriculum structure" on public.curriculum_structure;
drop policy if exists "Admin can update curriculum structure" on public.curriculum_structure;
drop policy if exists "Admin can delete curriculum structure" on public.curriculum_structure;

create policy "Anyone can view curriculum structure"
on public.curriculum_structure
for select
using (true);

create policy "Admin can insert curriculum structure"
on public.curriculum_structure
for insert
with check (public.is_admin());

create policy "Admin can update curriculum structure"
on public.curriculum_structure
for update
using (public.is_admin());

create policy "Admin can delete curriculum structure"
on public.curriculum_structure
for delete
using (public.is_admin());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'curriculum_structure'
  ) then
    alter publication supabase_realtime add table public.curriculum_structure;
  end if;
end $$;

create index if not exists idx_curriculum_structure_subject
on public.curriculum_structure(subject_id, node_type, parent_section_id);
