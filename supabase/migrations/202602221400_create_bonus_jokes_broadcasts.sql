create table if not exists public.bonus_jokes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  setup text not null,
  punchline text not null,
  created_at timestamptz not null default now(),
  constraint bonus_jokes_setup_not_blank_check check (length(btrim(setup)) > 0),
  constraint bonus_jokes_punchline_not_blank_check check (length(btrim(punchline)) > 0)
);

create index if not exists bonus_jokes_created_at_idx
  on public.bonus_jokes (created_at desc);

create index if not exists bonus_jokes_user_id_idx
  on public.bonus_jokes (user_id);

alter table public.bonus_jokes enable row level security;

grant select on table public.bonus_jokes to anon, authenticated;
grant insert on table public.bonus_jokes to authenticated;

drop policy if exists "Bonus jokes are publicly readable" on public.bonus_jokes;
create policy "Bonus jokes are publicly readable"
on public.bonus_jokes
for select
using (true);

drop policy if exists "Users can insert own bonus jokes" on public.bonus_jokes;
create policy "Users can insert own bonus jokes"
on public.bonus_jokes
for insert
to authenticated
with check (auth.uid() = user_id);
