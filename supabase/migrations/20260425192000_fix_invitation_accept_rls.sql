-- Migration: Fix RLS policies to allow invitation acceptance flow
--
-- Problem: When an invited user (not yet a family member) accepts an invitation,
-- the `families_select_member` and `family_members_select_member` policies block
-- them from reading the family (because is_family_member() returns false), causing
-- AcceptInvitation to return FAMILY_NOT_FOUND even when the family exists.
-- Similarly, `family_members_insert_owner` blocks them from inserting themselves
-- as a new member.
--
-- Fix: Add three targeted policies that open just enough access for the
-- invitation acceptance flow:
--   1. SELECT on families  — if there is an active, non-expired invitation for it
--   2. SELECT on family_members — same condition (needed to check palette conflicts)
--   3. INSERT on family_members — self-insert as 'member' via a valid invitation

-- 1. Allow any authenticated user to read a family when there is an active,
--    non-expired invitation for it. This lets the AcceptInvitation use case
--    load the family entity before the user becomes a member.
drop policy if exists families_select_via_invitation on public.families;
create policy families_select_via_invitation
  on public.families
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.family_invitations
      where family_id = families.id
        and status = 'active'
        and expires_at > now()
    )
  );

-- 2. Allow any authenticated user to read family members of a family when there
--    is an active, non-expired invitation for it. This lets AcceptInvitation
--    enumerate existing members to detect palette conflicts.
drop policy if exists family_members_select_via_invitation on public.family_members;
create policy family_members_select_via_invitation
  on public.family_members
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.family_invitations
      where family_id = family_members.family_id
        and status = 'active'
        and expires_at > now()
    )
  );

-- 3. Allow an authenticated user to insert themselves as a regular member
--    (role = 'member', not delegated) when a valid invitation exists for that
--    family. This lets AcceptInvitation add the accepting user to the family.
drop policy if exists family_members_insert_via_invitation on public.family_members;
create policy family_members_insert_via_invitation
  on public.family_members
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and role = 'member'
    and delegated_by_user_id is null
    and exists (
      select 1
      from public.family_invitations
      where family_id = family_members.family_id
        and status = 'active'
        and expires_at > now()
    )
  );
