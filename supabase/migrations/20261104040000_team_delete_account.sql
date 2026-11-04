-- Team dashboard v2 (2026-11-04): the team can delete a student's account
-- from /team (for privacy deletion requests, test accounts and fake
-- entries).
--
-- Deleting removes everything: the sign-in account in auth.users, and with
-- it (on delete cascade) their waitlist_responses row, answers, referral
-- code and raffle entry. Their photo has to be removed first through the
-- Storage API (Supabase won't delete a user who still owns files, and
-- deleting storage.objects rows in SQL would orphan the file); the page
-- does that, then calls team_delete_account().
--
-- Each deletion is recorded in private.team_deletions without the
-- student's name or email, so the raffle can be shown to be fair.

-- Your SU Google account signs in as @g.syr.edu, not @syr.edu.
insert into private.team_admins (email) values ('hpang05@g.syr.edu')
on conflict (email) do nothing;

create table if not exists private.team_deletions (
  id bigint generated always as identity primary key,
  deleted_user_id uuid not null,
  had_started boolean not null,
  had_finished boolean not null,
  had_photo boolean not null,
  deleted_by text not null,
  deleted_at timestamptz not null default now()
);
alter table private.team_deletions enable row level security;
revoke all on private.team_deletions from public, anon, authenticated;

-- The team can remove a student's photo (the page does this right before
-- deleting the account).
drop policy if exists "Team admins delete waitlist photos" on storage.objects;
create policy "Team admins delete waitlist photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'waitlist-photos'
    and (select private.is_team_admin())
  );

-- Deletes one student's account. Refuses anyone not on the team list, team
-- accounts (including your own), and accounts that still own files.
create or replace function public.team_delete_account(target uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  target_email text;
  started boolean;
  finished boolean;
  photo boolean;
  me_email text;
begin
  if not private.is_team_admin() then
    raise exception 'not a team admin' using errcode = '42501';
  end if;

  select lower(u.email), w.user_id is not null, w.completed_at is not null,
         w.photo_path is not null
    into target_email, started, finished, photo
  from auth.users u
  left join public.waitlist_responses w on w.user_id = u.id
  where u.id = target;
  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  if target = (select auth.uid())
     or exists (select 1 from private.team_admins a where a.email = target_email) then
    raise exception 'team accounts cannot be deleted here' using errcode = '42501',
      hint = 'team account';
  end if;

  if exists (
    select 1 from storage.objects o
    where o.owner_id = target::text or o.owner = target
  ) then
    raise exception 'account still owns files; remove them first'
      using errcode = '55000';
  end if;

  select lower(u.email) into me_email from auth.users u
  where u.id = (select auth.uid());

  insert into private.team_deletions
    (deleted_user_id, had_started, had_finished, had_photo, deleted_by)
  values (target, coalesce(started, false), coalesce(finished, false),
          coalesce(photo, false), me_email);

  delete from auth.users where id = target;
end;
$$;
revoke all on function public.team_delete_account(uuid) from public, anon;
grant execute on function public.team_delete_account(uuid) to authenticated;
