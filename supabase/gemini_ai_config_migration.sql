alter table public.ai_config
alter column model set default 'gemini-2.5-flash';

update public.ai_config
set model = 'gemini-2.5-flash',
    updated_at = now()
where model like 'gpt-%'
   or model is null
   or btrim(model) = '';

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ai_config'
  ) then
    alter publication supabase_realtime add table public.ai_config;
  end if;
end $$;
