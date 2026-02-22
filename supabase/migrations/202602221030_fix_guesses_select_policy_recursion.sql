create or replace function public.can_view_guesses_for_joke(target_joke_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guesses as own_guess
    where own_guess.user_id = auth.uid()
      and own_guess.joke_id = target_joke_id
  );
$$;

grant execute on function public.can_view_guesses_for_joke(uuid) to authenticated;

drop policy if exists "Guesses visible after own submission" on public.guesses;

create policy "Guesses visible after own submission"
on public.guesses
for select
to authenticated
using (public.can_view_guesses_for_joke(joke_id));
