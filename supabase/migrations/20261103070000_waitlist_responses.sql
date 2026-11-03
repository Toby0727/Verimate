-- Waitlist survey: one row per signed-in SU / ESF student.
-- Answers are saved step by step; completed_at is set once every answer is in,
-- which is what enters the student in the gift card raffle.
-- Allowed values mirror lib/waitlist/options.ts.

create table public.waitlist_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
    check (email ~* '^[^@]+@(syr\.edu|g\.syr\.edu|esf\.edu)$'),
  school text not null check (school in ('SU', 'ESF')),

  year text check (year in ('freshman', 'sophomore', 'junior', 'senior', 'graduate')),
  major text check (char_length(btrim(major)) between 1 and 80),
  budget text check (budget in (
    'under-600', '600-800', '800-1000', '1000-1200', '1200-1500', '1500-plus'
  )),
  areas text[] check (
    cardinality(areas) > 0
    and areas <@ array[
      'university-hill', 'south-campus', 'euclid', 'westcott', 'downtown', 'not-sure'
    ]::text[]
  ),
  study_abroad text check (study_abroad in (
    'no', 'spring-2027', 'summer-2027', 'fall-2027', 'spring-2028', 'not-sure'
  )),
  -- Empty array means "not needed"; null means not answered yet.
  sublet_out_terms text[] check (
    sublet_out_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
  ),
  sublet_in_terms text[] check (
    sublet_in_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
  ),
  roommate_terms text[] check (
    roommate_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
  ),
  drinking text check (drinking in ('never', 'socially', 'often')),
  smoking text check (smoking in ('no', 'outside', 'yes')),
  cannabis text check (cannabis in ('never', 'sometimes', 'often')),

  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint waitlist_school_matches_email check (
    (school = 'ESF') = (email ~* '@esf\.edu$')
  ),
  constraint waitlist_complete_has_all_answers check (
    completed_at is null or (
      year is not null and major is not null and budget is not null
      and areas is not null and study_abroad is not null
      and sublet_out_terms is not null and sublet_in_terms is not null
      and roommate_terms is not null and drinking is not null
      and smoking is not null and cannabis is not null
    )
  )
);

comment on table public.waitlist_responses is
  'Waitlist survey answers from SU / ESF students. completed_at not null = raffle entry.';

create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger waitlist_responses_updated_at
  before update on public.waitlist_responses
  for each row execute function public.set_waitlist_updated_at();

-- Students reach the table only through the Data API as themselves.
alter table public.waitlist_responses enable row level security;
revoke all on public.waitlist_responses from anon, authenticated;
grant select, insert, update on public.waitlist_responses to authenticated;

create policy "Students read their own response"
  on public.waitlist_responses for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- The email must be the one in the signed-in user's token, so nobody can
-- enter with someone else's school address.
create policy "Students add their own response"
  on public.waitlist_responses for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and email = (select auth.jwt() ->> 'email')
  );

create policy "Students update their own response"
  on public.waitlist_responses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and email = (select auth.jwt() ->> 'email')
  );
