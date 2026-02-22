create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  total_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_jokes (
  id uuid primary key default gen_random_uuid(),
  joke_date date not null unique,
  setup text not null,
  punchline text not null,
  source_api_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.guesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  joke_id uuid not null references public.daily_jokes (id) on delete cascade,
  guess_text text not null,
  is_correct boolean not null default false,
  similarity_score float8 not null default 0,
  created_at timestamptz not null default now(),
  constraint guesses_similarity_score_range_check
    check (similarity_score >= 0 and similarity_score <= 1)
);

create index if not exists guesses_user_id_idx on public.guesses (user_id);
create index if not exists guesses_joke_id_idx on public.guesses (joke_id);
create index if not exists guesses_created_at_idx on public.guesses (created_at desc);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.daily_jokes enable row level security;
alter table public.guesses enable row level security;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;
grant select on table public.daily_jokes to anon, authenticated;
grant select, insert on table public.guesses to authenticated;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles
for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Daily jokes are publicly readable" on public.daily_jokes;
create policy "Daily jokes are publicly readable"
on public.daily_jokes
for select
using (true);

drop policy if exists "Users can insert own guesses" on public.guesses;
create policy "Users can insert own guesses"
on public.guesses
for insert
to authenticated
with check (auth.uid() = user_id);
