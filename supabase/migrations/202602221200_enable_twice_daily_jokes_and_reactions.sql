alter table public.daily_jokes
  add column if not exists release_slot text;

update public.daily_jokes
set release_slot = coalesce(release_slot, 'AM')
where release_slot is null;

alter table public.daily_jokes
  alter column release_slot set default 'AM';

alter table public.daily_jokes
  alter column release_slot set not null;

alter table public.daily_jokes
  drop constraint if exists daily_jokes_release_slot_check;

alter table public.daily_jokes
  add constraint daily_jokes_release_slot_check
  check (release_slot in ('AM', 'PM'));

alter table public.daily_jokes
  drop constraint if exists daily_jokes_joke_date_key;

drop index if exists public.daily_jokes_joke_date_key;

create unique index if not exists daily_jokes_joke_date_release_slot_key
  on public.daily_jokes (joke_date, release_slot);

create index if not exists daily_jokes_release_slot_idx
  on public.daily_jokes (release_slot);

create table if not exists public.joke_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  joke_id uuid not null references public.daily_jokes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, joke_id)
);

create table if not exists public.joke_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  joke_id uuid not null references public.daily_jokes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, joke_id)
);

create index if not exists joke_likes_joke_id_idx
  on public.joke_likes (joke_id);

create index if not exists joke_favorites_joke_id_idx
  on public.joke_favorites (joke_id);

alter table public.joke_likes enable row level security;
alter table public.joke_favorites enable row level security;

grant select on table public.joke_likes to anon, authenticated;
grant select, insert, delete on table public.joke_likes to authenticated;
grant select, insert, delete on table public.joke_favorites to authenticated;

drop policy if exists "Joke likes are readable" on public.joke_likes;
create policy "Joke likes are readable"
on public.joke_likes
for select
using (true);

drop policy if exists "Users can insert own joke likes" on public.joke_likes;
create policy "Users can insert own joke likes"
on public.joke_likes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own joke likes" on public.joke_likes;
create policy "Users can delete own joke likes"
on public.joke_likes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own favorites" on public.joke_favorites;
create policy "Users can read own favorites"
on public.joke_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.joke_favorites;
create policy "Users can insert own favorites"
on public.joke_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.joke_favorites;
create policy "Users can delete own favorites"
on public.joke_favorites
for delete
to authenticated
using (auth.uid() = user_id);
