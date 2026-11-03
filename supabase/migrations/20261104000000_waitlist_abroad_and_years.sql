-- Waitlist v3 (2026-11-03): more years (5th year, grad 1st-3rd year, PhD
-- instead of one "graduate"), and where a student studies away, term by term.
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
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.completed_at := null;
  else
    new.created_at := old.created_at;
    new.completed_at := old.completed_at;
  end if;
  new.updated_at := now();
  if new.completed_at is null and all_answered
     and now() <= timestamptz '2026-12-01 04:59:59+00' then
    new.completed_at := now();
  end if;
  return new;
end;
$$;
