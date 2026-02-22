create extension if not exists pg_trgm with schema public;

create or replace function public.calculate_similarity(source_text text, target_text text)
returns float
language sql
immutable
as $$
  select similarity(
    regexp_replace(lower(trim(coalesce(source_text, ''))), '\\s+', ' ', 'g'),
    regexp_replace(lower(trim(coalesce(target_text, ''))), '\\s+', ' ', 'g')
  )::float;
$$;

create or replace function public.check_guess(joke_id uuid, user_guess text)
returns table (is_correct boolean, score float)
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_punchline text;
  similarity_score double precision;
begin
  select daily_jokes.punchline
  into stored_punchline
  from public.daily_jokes
  where daily_jokes.id = joke_id;

  if stored_punchline is null then
    return query select false, 0::float;
    return;
  end if;

  similarity_score := public.calculate_similarity(user_guess, stored_punchline);

  return query
  select (similarity_score >= 0.8), similarity_score::float;
end;
$$;

grant execute on function public.calculate_similarity(text, text) to authenticated;
grant execute on function public.check_guess(uuid, text) to authenticated;

alter table public.guesses enable row level security;

drop policy if exists "Guesses visible after own submission" on public.guesses;

create policy "Guesses visible after own submission"
on public.guesses
for select
using (
  exists (
    select 1
    from public.guesses as own_guess
    where own_guess.user_id = auth.uid()
      and own_guess.joke_id = guesses.joke_id
  )
);
