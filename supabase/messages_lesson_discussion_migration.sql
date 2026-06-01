alter table public.messages
add column if not exists lesson_id text;

create index if not exists idx_messages_lesson
on public.messages(lesson_id);
