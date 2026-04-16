-- Phase 11: Delegated Users (US-1.4)
--
-- The `users` table has `id uuid primary key references auth.users(id)` which
-- prevents inserting rows for delegated users who have no Supabase auth account.
-- We drop that FK constraint so the parent can create delegated user records
-- directly.  A BEFORE DELETE trigger on auth.users preserves the cascade
-- deletion behaviour for regular (auth-backed) users.

-- 1. Drop the FK from users.id to auth.users.id
--    (Supabase auto-names this constraint "users_id_fkey")
alter table public.users drop constraint if exists users_id_fkey;

-- 2. Re-add cascade deletion for auth-backed users via a trigger
create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

create trigger on_auth_user_deleted
after delete on auth.users
for each row
execute function public.handle_auth_user_deleted();

-- 3. Allow a parent to read their own delegated users
create policy users_select_delegated
on public.users
for select
to authenticated
using (delegated_by_user_id = (select auth.uid()));

-- 4. Allow a parent to insert delegated user rows
create policy users_insert_delegated
on public.users
for insert
to authenticated
with check (
  delegated_by_user_id = (select auth.uid())
);

-- 5. Allow a parent to update their delegated users
create policy users_update_delegated
on public.users
for update
to authenticated
using (delegated_by_user_id = (select auth.uid()))
with check (delegated_by_user_id = (select auth.uid()));

-- 6. Allow a parent to delete their delegated users
create policy users_delete_delegated
on public.users
for delete
to authenticated
using (delegated_by_user_id = (select auth.uid()));

-- 7. Allow a family owner to insert delegated members (role = 'delegated')
--    into family_members without requiring is_family_owner for the entry
--    itself (the existing policy already handles owner/member inserts).
--    The existing events RLS (can_manage_user / can_manage_event) already
--    permits parents to create/update/delete events on behalf of their
--    delegated children, so no further event policy changes are needed.
