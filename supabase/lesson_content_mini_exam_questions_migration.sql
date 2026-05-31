alter table public.lesson_content
add column if not exists mini_exam_questions text not null default '[]';

update public.lesson_content
set mini_exam_questions = '[]'
where mini_exam_questions is null or btrim(mini_exam_questions) = '';
