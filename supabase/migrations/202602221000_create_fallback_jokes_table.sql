create table if not exists public.fallback_jokes (
  id uuid primary key default gen_random_uuid(),
  setup text not null,
  punchline text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint fallback_jokes_setup_punchline_unique unique (setup, punchline),
  constraint fallback_jokes_setup_question_check check (position('?' in setup) > 0)
);

create index if not exists fallback_jokes_is_active_idx
  on public.fallback_jokes (is_active);

insert into public.fallback_jokes (setup, punchline)
values
  ('Why did the scarecrow win an award?', 'Because he was outstanding in his field.'),
  ('What do you call fake spaghetti?', 'An impasta.'),
  ('Why do cows wear bells?', 'Because their horns do not work.'),
  ('Why could the bicycle not stand up by itself?', 'It was two-tired.'),
  ('What do you call cheese that is not yours?', 'Nacho cheese.'),
  ('Why did the math book look sad?', 'Because it had too many problems.')
on conflict do nothing;
