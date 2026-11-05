-- Waitlist v6 (2026-11-05): living-together habits and where sign-ups came from.
--
-- 1. Three more step-6 questions the posters promise matching on: sleep
--    schedule (night owls), tidiness (clean freaks) and how often guests
--    come over. Values mirror SLEEP / CLEANLINESS / GUESTS in
--    lib/waitlist/options.ts. The survey asks them; the raffle trigger
--    (set_waitlist_server_fields) is left as it is, so finishing doesn't
--    depend on them server-side and this file can't clash with other
--    versions of that trigger.
-- 2. source: the ?src= tag on the poster QR code or story link a student
--    first came in on (e.g. ig-story, slocum-gym-rat). Set once, then kept.
--
-- Run this in SQL Editor BEFORE deploying the code that saves these
-- columns; until then saving the survey would fail on the unknown columns.

alter table public.waitlist_responses
  add column if not exists sleep text check (sleep in ('early', 'flexible', 'late')),
  add column if not exists cleanliness text check (cleanliness in ('spotless', 'tidy', 'relaxed')),
  add column if not exists guests text check (guests in ('rarely', 'sometimes', 'often')),
  add column if not exists source text check (
    char_length(source) <= 40 and source ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  );

-- The first source wins: later saves (another poster, a cleared browser)
-- can't change where a student actually found us.
create or replace function public.keep_waitlist_source()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.source is not null then
    new.source := old.source;
  end if;
  return new;
end;
$$;

drop trigger if exists waitlist_responses_keep_source on public.waitlist_responses;
create trigger waitlist_responses_keep_source
  before update on public.waitlist_responses
  for each row execute function public.keep_waitlist_source();

-- The team dashboard returns the new columns too. Its result columns
-- change, so the function has to be dropped and created again.
drop function if exists public.team_waitlist();
create function public.team_waitlist()
returns table (
  user_id uuid,
  email text,
  google_name text,
  account_created_at timestamptz,
  last_sign_in_at timestamptz,
  school text,
  has_response boolean,
  name text,
  gender text,
  year text,
  major text,
  budget text[],
  areas text[],
  study_abroad text,
  study_abroad_plans text[],
  sublet_out_terms text[],
  sublet_in_terms text[],
  roommate_terms text[],
  drinking text,
  smoking text,
  cannabis text,
  greek_life text,
  pets text,
  sleep text,
  cleanliness text,
  guests text,
  source text,
  photo_path text,
  photo_uploaded boolean,
  referral_code text,
  referred_by text,
  referral_count integer,
  started_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_team_admin() then
    raise exception 'not a team admin' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    lower(u.email)::text,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
    u.created_at,
    u.last_sign_in_at,
    w.school,
    w.user_id is not null,
    w.name,
    w.gender,
    w.year,
    w.major,
    w.budget,
    w.areas,
    w.study_abroad,
    w.study_abroad_plans,
    w.sublet_out_terms,
    w.sublet_in_terms,
    w.roommate_terms,
    w.drinking,
    w.smoking,
    w.cannabis,
    w.greek_life,
    w.pets,
    w.sleep,
    w.cleanliness,
    w.guests,
    w.source,
    w.photo_path,
    -- The photo bonus only counts if the file really is in storage.
    exists (
      select 1 from storage.objects o
      where o.bucket_id = 'waitlist-photos' and o.name = w.photo_path
    ),
    w.referral_code,
    w.referred_by,
    -- Same rule as my_referral_count(): friends on a school account who
    -- finished with this code.
    (
      select count(*)::integer
      from public.waitlist_responses friend
      where w.referral_code is not null
        and friend.referred_by = w.referral_code
        and friend.completed_at is not null
        and friend.school is not null
    ),
    w.created_at,
    w.updated_at,
    w.completed_at
  from auth.users u
  left join public.waitlist_responses w on w.user_id = u.id
  order by u.created_at desc;
end;
$$;
revoke all on function public.team_waitlist() from public, anon;
grant execute on function public.team_waitlist() to authenticated;
