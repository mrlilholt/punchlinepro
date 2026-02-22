alter table public.profiles
  alter column total_score type double precision
  using coalesce(total_score, 0)::double precision;

alter table public.profiles
  alter column total_score set default 0;

create or replace function public.compute_profile_total_score(target_user_id uuid)
returns double precision
language sql
stable
set search_path = public
as $$
  select coalesce(
    round(sum((guesses.similarity_score * 100)::numeric), 1)::double precision,
    0
  )
  from public.guesses
  where guesses.user_id = target_user_id;
$$;

create or replace function public.refresh_profile_total_score_from_guesses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.profiles
    set total_score = public.compute_profile_total_score(old.user_id)
    where id = old.user_id;

    return old;
  end if;

  update public.profiles
  set total_score = public.compute_profile_total_score(new.user_id)
  where id = new.user_id;

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    update public.profiles
    set total_score = public.compute_profile_total_score(old.user_id)
    where id = old.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists guesses_refresh_profile_total_score on public.guesses;

create trigger guesses_refresh_profile_total_score
after insert or update or delete on public.guesses
for each row
execute function public.refresh_profile_total_score_from_guesses();

update public.profiles
set total_score = public.compute_profile_total_score(id);
