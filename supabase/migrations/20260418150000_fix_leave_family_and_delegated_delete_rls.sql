-- Fix: Allow non-owner members to leave a family by deleting their own
-- membership row, and allow parents to delete their delegated children's
-- membership rows from any family.

-- 1. Allow a member to delete their own family_members row (leave family).
--    The domain layer prevents the owner from self-removing, but we also
--    guard against that in SQL with `role <> 'owner'`.
drop policy if exists family_members_delete_self on public.family_members;
create policy family_members_delete_self
on public.family_members
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and role <> 'owner'
);

-- 2. Allow a parent to delete their delegated child's family_members rows.
--    This is needed when removing a delegated user who may be in a family
--    that the parent does not own.
drop policy if exists family_members_delete_delegated_parent on public.family_members;
create policy family_members_delete_delegated_parent
on public.family_members
for delete
to authenticated
using (
  delegated_by_user_id = (select auth.uid())
  and role = 'delegated'
);
