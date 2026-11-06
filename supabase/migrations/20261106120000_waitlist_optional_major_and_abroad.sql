-- Waitlist v8 (2026-11-06): a shorter, simpler survey.
--
-- 1. Major is optional. The raffle trigger and the "finished means every
--    answer is in" check stop requiring it.
-- 2. Study abroad no longer asks where. study_abroad_plans now also takes
--    a bare term ("fall-2027"); older "fall-2027:london" pairs stay valid.
-- (The survey also stopped asking "Where do you live now?"; current_home
-- stays as it is, so it needs nothing here.)
--
-- Run BEFORE deploying the code that saves bare terms, or a student with a
-- term away can't save the study abroad step. Safe to run more than once.
--
-- The trigger function is edited in place (the major condition is cut
-- from the live definition) rather than rewritten from an older copy, so
-- this works whether or not v5 (20261104020000) has been run.

do $$
declare
  def text;
  con record;
  check_def text;
begin
  -- 1a. The raffle trigger: drop "new.major is not null" from all_answered.
  def := pg_get_functiondef('public.set_waitlist_server_fields'::regproc);
  def := regexp_replace(def, '\s+and\s+new\.major\s+is\s+not\s+null', '', 'gi');
  def := regexp_replace(def, 'new\.major\s+is\s+not\s+null\s+and\s+', '', 'gi');
  if def ~* 'new\.major' then
    raise exception 'set_waitlist_server_fields still mentions new.major; edit it by hand';
  end if;
  execute def;

  -- 1b. Every check on the table that requires a major for a finished row.
  for con in
    select c.conname, pg_get_constraintdef(c.oid) as def
    from pg_constraint c
    where c.conrelid = 'public.waitlist_responses'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ~* '\(major IS NOT NULL\)'
  loop
    check_def := regexp_replace(con.def, '\(major IS NOT NULL\) AND ', '', 'gi');
    check_def := regexp_replace(check_def, ' AND \(major IS NOT NULL\)', '', 'gi');
    if check_def ~* 'major IS NOT NULL' then
      raise exception 'constraint % still requires a major; edit it by hand', con.conname;
    end if;
    execute format('alter table public.waitlist_responses drop constraint %I', con.conname);
    execute format('alter table public.waitlist_responses add constraint %I %s', con.conname, check_def);
  end loop;

  -- 2. Drop the old term:place format check(s), whatever they're named.
  for con in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.waitlist_responses'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ~ 'study_abroad_plans'
      and pg_get_constraintdef(c.oid) ~ 'los-angeles'
  loop
    execute format('alter table public.waitlist_responses drop constraint %I', con.conname);
  end loop;
end;
$$;

-- 2 (cont.). Each item is a term, optionally followed by ":place".
alter table public.waitlist_responses
  add constraint waitlist_responses_study_abroad_plans_check check (
    cardinality(study_abroad_plans) between 1 and 4
    and array_to_string(study_abroad_plans, ',')
      ~ '^(spring-2027|summer-2027|fall-2027|spring-2028)(:(los-angeles|new-york|washington-dc|florence|london|madrid|santiago|strasbourg|seoul|tokyo|hong-kong|shanghai|taipei|copenhagen|stockholm|prague|dublin|edinburgh|barcelona|rome|berlin|paris|at-sea|other|not-sure))?(,(spring-2027|summer-2027|fall-2027|spring-2028)(:(los-angeles|new-york|washington-dc|florence|london|madrid|santiago|strasbourg|seoul|tokyo|hong-kong|shanghai|taipei|copenhagen|stockholm|prague|dublin|edinburgh|barcelona|rome|berlin|paris|at-sea|other|not-sure))?)*$'
  );

-- Quick check after running: both should return no rows.
--   select pg_get_functiondef('public.set_waitlist_server_fields'::regproc) ~* 'major';  -- false
--   select conname from pg_constraint
--   where conrelid = 'public.waitlist_responses'::regclass
--     and pg_get_constraintdef(oid) ~* 'major IS NOT NULL';
