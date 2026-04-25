-- Migration: Fix recursion in family invitation RLS evaluation
--
-- Problem:
-- families_select_via_invitation and family_members_*_via_invitation policies
-- read public.family_invitations. The previous family_invitations owner policies
-- also queried public.families, which can trigger a circular policy evaluation
-- path and raise 42P17 (infinite recursion detected).
--
-- Fix:
-- Recreate family_invitations owner policies using SECURITY DEFINER helpers
-- that do not depend on public.families reads.

drop policy if exists family_invitations_insert_owner on public.family_invitations;
create policy family_invitations_insert_owner
  on public.family_invitations
  for insert
  with check (
    auth.uid() = created_by
    and (select public.is_family_owner(family_id))
  );

drop policy if exists family_invitations_select_owner on public.family_invitations;
create policy family_invitations_select_owner
  on public.family_invitations
  for select
  using ((select public.is_family_owner(family_id)));

drop policy if exists family_invitations_update_owner on public.family_invitations;
create policy family_invitations_update_owner
  on public.family_invitations
  for update
  using ((select public.is_family_owner(family_id)))
  with check ((select public.is_family_owner(family_id)));

drop policy if exists family_invitations_delete_owner on public.family_invitations;
create policy family_invitations_delete_owner
  on public.family_invitations
  for delete
  using ((select public.is_family_owner(family_id)));
