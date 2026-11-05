-- Waitlist v7 (2026-11-05): hobbies, and where a student subletting out lives now.
--
-- Run AFTER v6 (20261105000000_waitlist_habits_and_source.sql): the team
-- function below returns v6's columns too. v6 can safely be run again if
-- you're not sure it ran. Run this BEFORE deploying the code that saves
-- these columns; until then saving the survey fails on the unknown columns.
--
-- 1. hobbies: the tiles on the new hobbies page (step 7). Values mirror
--    HOBBIES in lib/waitlist/options.ts.
-- 2. custom_hobbies: up to 5 of their own, each "icon:label" (icon from
--    CUSTOM_HOBBY_ICONS, label 1-30 characters, not starting with = + - @
--    so an exported spreadsheet never runs it as a formula).
-- 3. current_home: the building or street they live in now, asked only
--    when they tick a "Sublet my place" term. Picked from our apartment
--    list or typed; at most 120 characters, same formula rule.
--
-- The raffle trigger is left as it is (as in v6), so finishing the raffle
-- doesn't depend on these server-side.

alter table public.waitlist_responses
  add column if not exists hobbies text[] check (
    cardinality(hobbies) <= 40 and hobbies <@ array[
      'gym',
      'running',
      'sports',
      'cuse-games',
      'hiking',
      'cycling',
      'yoga',
      'skiing',
      'swimming',
      'music',
      'instrument',
      'singing',
      'dancing',
      'gaming',
      'movies',
      'reading',
      'writing',
      'art',
      'photography',
      'cooking',
      'coffee',
      'travel',
      'going-out',
      'coding',
      'fashion',
      'volunteering',
      'board-games',
      'plants',
      'theater'
    ]::text[]
  ),
  add column if not exists custom_hobbies text[] check (
    cardinality(custom_hobbies) = 0 or (
      cardinality(custom_hobbies) <= 5
      and array_position(custom_hobbies, null) is null
      and position(chr(10) in array_to_string(custom_hobbies, '')) = 0
      -- Joined with newlines, every item must be "icon:label" (the regex
      -- reads \n as a newline).
      and array_to_string(custom_hobbies, chr(10)) ~
        '^(star|heart|sparkles|music|camera|brush|leaf|tent|rocket|puzzle|zap|smile):[^\n=+@-][^\n]{0,29}(\n(star|heart|sparkles|music|camera|brush|leaf|tent|rocket|puzzle|zap|smile):[^\n=+@-][^\n]{0,29})*$'
    )
  ),
  add column if not exists current_home text check (
    char_length(btrim(current_home)) between 1 and 120 and current_home !~ '^\s*[=+@-]'
  );

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
  current_home text,
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
  hobbies text[],
  custom_hobbies text[],
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
    w.current_home,
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
    w.hobbies,
    w.custom_hobbies,
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
