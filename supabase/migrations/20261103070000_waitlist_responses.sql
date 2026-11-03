-- Waitlist survey: one row per signed-in SU / ESF student.
-- Answers are saved step by step; completed_at is set once every answer is in,
-- which is what enters the student in the gift card raffle. A photo of
-- themselves (optional) earns one bonus entry.
-- Allowed values mirror lib/waitlist/options.ts.

create table public.waitlist_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
    check (email ~* '^[^@]+@(syr\.edu|g\.syr\.edu|esf\.edu)$'),
  school text not null check (school in ('SU', 'ESF')),

  -- Free text can't start with = + - @ so a CSV export opened in a
  -- spreadsheet never runs it as a formula.
  name text check (char_length(btrim(name)) between 1 and 80 and name !~ '^\s*[=+@-]'),
  -- The one object a student may have in the private waitlist-photos bucket.
  photo_path text check (photo_path = user_id::text || '/photo.jpg'),
  year text check (year in ('freshman', 'sophomore', 'junior', 'senior', 'graduate')),
  major text check (char_length(btrim(major)) between 1 and 80 and major !~ '^\s*[=+@-]'),
  budget text check (budget in (
    'under-600', '600-800', '800-1000', '1000-1200', '1200-1500', '1500-plus'
  )),
  areas text[] check (
    cardinality(areas) between 1 and 6
    and areas <@ array[
      'university-hill', 'south-campus', 'euclid', 'westcott', 'downtown', 'not-sure'
    ]::text[]
  ),
  study_abroad text check (study_abroad in (
    'no', 'spring-2027', 'summer-2027', 'fall-2027', 'spring-2028', 'not-sure'
  )),
  -- Empty array means "not needed"; null means not answered yet.
  sublet_out_terms text[] check (
    cardinality(sublet_out_terms) <= 4 and sublet_out_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
  ),
  sublet_in_terms text[] check (
    cardinality(sublet_in_terms) <= 4 and sublet_in_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
  ),
  roommate_terms text[] check (
    cardinality(roommate_terms) <= 4 and roommate_terms <@ array['spring-2027', 'summer-2027', 'fall-2027', 'spring-2028']::text[]
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
      name is not null and year is not null and major is not null and budget is not null
      and areas is not null and study_abroad is not null
      and sublet_out_terms is not null and sublet_in_terms is not null
      and roommate_terms is not null and drinking is not null
      and smoking is not null and cannabis is not null
    )
  )
);

comment on table public.waitlist_responses is
  'Waitlist survey answers from SU / ESF students. completed_at not null = raffle entry; photo_path not null and the photo exists in storage = bonus entry.';

-- The server, not the browser, decides created_at, updated_at and
-- completed_at (the raffle entry time): completion is stamped the first time
-- every answer is in, kept on later edits, and refused after entries close
-- (11:59 PM Eastern, Nov 30 2026; keep in sync with RAFFLE in
-- lib/waitlist/options.ts).
create or replace function public.set_waitlist_server_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  all_answered boolean := new.name is not null and new.year is not null
    and new.major is not null and new.budget is not null
    and new.areas is not null and new.study_abroad is not null
    and new.sublet_out_terms is not null and new.sublet_in_terms is not null
    and new.roommate_terms is not null and new.drinking is not null
    and new.smoking is not null and new.cannabis is not null;
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

create trigger waitlist_responses_server_fields
  before insert or update on public.waitlist_responses
  for each row execute function public.set_waitlist_server_fields();

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

-- Photos: private bucket, one JPEG per student at <user id>/photo.jpg
-- (re-encoded in the browser, which also strips EXIF location data).
-- Only school accounts that have started the survey can upload. Upload with
-- upsert needs insert, select and update; delete lets students remove it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('waitlist-photos', 'waitlist-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Students upload their own waitlist photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
    and (select auth.jwt() ->> 'email') ~* '@(syr\.edu|g\.syr\.edu|esf\.edu)$'
    and exists (
      select 1 from public.waitlist_responses w
      where w.user_id = (select auth.uid())
    )
  );

create policy "Students read their own waitlist photo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
  );

create policy "Students replace their own waitlist photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
  )
  with check (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
    and (select auth.jwt() ->> 'email') ~* '@(syr\.edu|g\.syr\.edu|esf\.edu)$'
  );

create policy "Students delete their own waitlist photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
  );
