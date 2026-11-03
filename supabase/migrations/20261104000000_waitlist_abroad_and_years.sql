-- Waitlist v3 (2026-11-03): more years (5th year, grad 1st-3rd year, PhD
-- instead of one "graduate"), where a student studies away term by term,
-- and referral codes (each friend who finishes with your code raises your
-- raffle chance 10%).
-- study_abroad_plans holds one "term:place" pair per term away, e.g.
-- {fall-2027:london,spring-2028:seoul}. Places mirror ABROAD_PLACES in
-- lib/waitlist/options.ts (SU's US study-away semesters, SU Abroad centers,
-- partner programs and a semester at sea). study_abroad keeps "no" / "not-sure", or the
-- earliest term away.
--
-- Students who finished before this keep their raffle entry; the trigger
-- only asks new finishers with a term away for a place for each term.

alter table public.waitlist_responses
  drop constraint waitlist_responses_year_check;
alter table public.waitlist_responses
  add constraint waitlist_responses_year_check check (year in (
    'freshman', 'sophomore', 'junior', 'senior', 'fifth-year', 'grad-1', 'grad-2', 'grad-3', 'phd'
  ));

alter table public.waitlist_responses
  add column study_abroad_plans text[] check (
    cardinality(study_abroad_plans) between 1 and 4
    and array_to_string(study_abroad_plans, ',')
      ~ '^(spring-2027|summer-2027|fall-2027|spring-2028):(los-angeles|new-york|washington-dc|florence|london|madrid|santiago|strasbourg|seoul|tokyo|hong-kong|shanghai|taipei|copenhagen|stockholm|prague|dublin|edinburgh|barcelona|rome|berlin|paris|at-sea|other|not-sure)(,(spring-2027|summer-2027|fall-2027|spring-2028):(los-angeles|new-york|washington-dc|florence|london|madrid|santiago|strasbourg|seoul|tokyo|hong-kong|shanghai|taipei|copenhagen|stockholm|prague|dublin|edinburgh|barcelona|rome|berlin|paris|at-sea|other|not-sure))*$'
  ),
  -- Places only make sense with an actual term away.
  add constraint waitlist_abroad_plans_need_term check (
    study_abroad_plans is null or study_abroad not in ('no', 'not-sure')
  );

-- Referrals: every student gets a code; referred_by is the code they
-- joined with. Codes are made and checked by the database, never trusted
-- from the browser.
alter table public.waitlist_responses
  add column referral_code text unique check (referral_code ~ '^[A-Z0-9]{6}$'),
  add column referred_by text check (referred_by ~ '^[A-Z0-9]{6}$');

-- Looking up another student's code needs to see past RLS, so it lives in a
-- schema the Data API doesn't expose and returns only the owner's id.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.referral_code_owner(code text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select user_id from public.waitlist_responses where referral_code = code
$$;
revoke all on function private.referral_code_owner(text) from public;
grant execute on function private.referral_code_owner(text) to authenticated;

-- How many friends finished the survey with the caller's code. Only ever
-- returns a count for the signed-in student.
create or replace function public.my_referral_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.waitlist_responses friend
  where friend.completed_at is not null
    and friend.referred_by = (
      select me.referral_code from public.waitlist_responses me
      where me.user_id = (select auth.uid())
    )
$$;
revoke all on function public.my_referral_count() from public, anon;
grant execute on function public.my_referral_count() to authenticated;

create or replace function public.set_waitlist_server_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  all_answered boolean := new.name is not null and new.gender is not null
    and new.year is not null and new.major is not null
    and new.budget is not null and new.areas is not null
    and new.study_abroad is not null
    and (new.study_abroad in ('no', 'not-sure') or new.study_abroad_plans is not null)
    and new.sublet_out_terms is not null and new.sublet_in_terms is not null
    and new.roommate_terms is not null and new.drinking is not null
    and new.smoking is not null and new.cannabis is not null
    and new.greek_life is not null and new.pets is not null;
  ref_owner uuid;
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.completed_at := null;
  else
    new.created_at := old.created_at;
    new.completed_at := old.completed_at;
  end if;

  -- Each student's own code: made once, then never changed.
  if tg_op = 'UPDATE' and old.referral_code is not null then
    new.referral_code := old.referral_code;
  else
    loop
      new.referral_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      exit when private.referral_code_owner(new.referral_code) is null;
    end loop;
  end if;

  -- The code they joined with: must be someone else's real code, and is
  -- locked once they've finished.
  if tg_op = 'UPDATE' and old.completed_at is not null and old.referred_by is not null then
    new.referred_by := old.referred_by;
  elsif new.referred_by is not null
    and new.referred_by is distinct from (case when tg_op = 'UPDATE' then old.referred_by end) then
    ref_owner := private.referral_code_owner(new.referred_by);
    if ref_owner is null or ref_owner = new.user_id then
      raise exception 'invalid referral code' using errcode = 'P0001';
    end if;
  end if;
  new.updated_at := now();
  if new.completed_at is null and all_answered
     and now() <= timestamptz '2026-12-01 04:59:59+00' then
    new.completed_at := now();
  end if;
  return new;
end;
$$;

-- Give students who joined before this a code of their own.
update public.waitlist_responses set updated_at = now() where referral_code is null;
