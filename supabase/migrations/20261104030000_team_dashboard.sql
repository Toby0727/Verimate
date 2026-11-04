-- Team dashboard (2026-11-04): a private page at /team where the Verimate
-- team sees every account that signed in, how far each got in the survey,
-- their answers, photo, referrals and raffle standing.
--
-- Who counts as team is a list of Google emails in private.team_admins
-- (not exposed through the Data API). Everything is checked here in the
-- database against the signed-in user's own account; the page itself is
-- not a security boundary.
--
-- To add a teammate later, run in SQL Editor:
--   insert into private.team_admins (email) values ('name@g.syr.edu');

create schema if not exists private;

create table if not exists private.team_admins (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+$'),
  added_at timestamptz not null default now()
);
alter table private.team_admins enable row level security;
revoke all on private.team_admins from public, anon, authenticated;

insert into private.team_admins (email) values ('hpang05@syr.edu')
on conflict (email) do nothing;

-- True only when the signed-in user is a confirmed Google account whose
-- email is on the team list. Says nothing about anyone else.
create or replace function private.is_team_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join private.team_admins a on a.email = lower(u.email)
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and u.raw_app_meta_data ->> 'provider' = 'google'
  )
$$;
revoke all on function private.is_team_admin() from public, anon;
grant execute on function private.is_team_admin() to authenticated;

-- Every account that has signed in, with its survey row if there is one.
-- Refuses anyone who isn't on the team list.
create or replace function public.team_waitlist()
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

-- The team can view (not change) students' photos on the dashboard.
drop policy if exists "Team admins read waitlist photos" on storage.objects;
create policy "Team admins read waitlist photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'waitlist-photos'
    and (select private.is_team_admin())
  );
