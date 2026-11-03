-- Waitlist v2 (2026-11-03): gender on step 1, several budgets allowed on
-- step 2, Greek life and pets on step 6. Allowed values mirror
-- lib/waitlist/options.ts.
--
-- Students who finished before this keep their raffle entry: the
-- "complete" constraint still checks only the original answers, while the
-- trigger requires the new ones for anyone finishing from now on.

alter table public.waitlist_responses
  add column gender text check (gender in ('woman', 'man', 'non-binary', 'prefer-not')),
  add column greek_life text check (greek_life in ('member', 'rushing', 'no')),
  add column pets text check (pets in ('have-pet', 'okay', 'no-pets'));

-- One budget becomes a list of budgets; an existing answer becomes a
-- one-item list.
alter table public.waitlist_responses
  drop constraint waitlist_responses_budget_check;
alter table public.waitlist_responses
  alter column budget type text[]
    using case when budget is null then null else array[budget] end;
alter table public.waitlist_responses
  add constraint waitlist_responses_budget_check check (
    cardinality(budget) between 1 and 6
    and budget <@ array[
      'under-600', '600-800', '800-1000', '1000-1200', '1200-1500', '1500-plus'
    ]::text[]
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
