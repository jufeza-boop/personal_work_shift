-- Fix: allow members to update their own family_members row (e.g. palette
-- selection) and allow parents to update their delegated user's rows.
--
-- Before this fix only the family owner could UPDATE family_members rows
-- (family_members_update_owner). Non-owner members couldn't select their own
-- palette and parents couldn't assign palettes to their delegated users.

-- 1. A member can update their own row (e.g. to change their color palette).
drop policy if exists family_members_update_self on public.family_members;
create policy family_members_update_self
on public.family_members
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- 2. A parent can update their delegated child's row (e.g. to assign a palette).
drop policy if exists family_members_update_delegated_parent on public.family_members;
create policy family_members_update_delegated_parent
on public.family_members
for update
to authenticated
using (delegated_by_user_id = (select auth.uid()))
with check (delegated_by_user_id = (select auth.uid()));
