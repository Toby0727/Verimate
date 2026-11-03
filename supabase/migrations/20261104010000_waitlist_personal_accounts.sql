-- Waitlist v4 (2026-11-03): personal Google accounts can join too.
-- school is now null for a personal account (not verified as a student);
-- SU / ESF accounts still get school set from their email. A school account
-- raises the raffle chance 5%, and only school-account friends count toward
-- referral bonuses, since anyone can make a personal account.

alter table public.waitlist_responses
  drop constraint waitlist_responses_email_check;
alter table public.waitlist_responses
  add constraint waitlist_responses_email_check
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.waitlist_responses
  alter column school drop not null;

-- school must match the email: SU for syr.edu / g.syr.edu, ESF for esf.edu,
-- and null for anything else.
alter table public.waitlist_responses
  drop constraint waitlist_school_matches_email;
alter table public.waitlist_responses
  add constraint waitlist_school_matches_email check (
    school is not distinct from (
      case
        when email ~* '@(syr\.edu|g\.syr\.edu)$' then 'SU'
        when email ~* '@esf\.edu$' then 'ESF'
      end
    )
  );

-- Photos: any signed-in student with a waitlist row, not just school ones.
drop policy "Students upload their own waitlist photo" on storage.objects;
create policy "Students upload their own waitlist photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'waitlist-photos'
    and name = (select auth.uid())::text || '/photo.jpg'
    and exists (
      select 1 from public.waitlist_responses w
      where w.user_id = (select auth.uid())
    )
  );

drop policy "Students replace their own waitlist photo" on storage.objects;
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
  );

-- Referral bonuses count only friends on a school account.
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
    and friend.school is not null
    and friend.referred_by = (
      select me.referral_code from public.waitlist_responses me
      where me.user_id = (select auth.uid())
    )
$$;
revoke all on function public.my_referral_count() from public, anon;
grant execute on function public.my_referral_count() to authenticated;
