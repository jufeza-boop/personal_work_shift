-- Fix: allow parents to look up their own delegated users via lookup_family_member_user.
--
-- Before this fix, lookup_family_member_user only returned a user if they
-- were the caller themselves OR shared a family with the caller. This meant
-- a delegated user who had not yet been added to any family could not be
-- found, causing rename/delete/palette actions to fail with USER_NOT_FOUND.

create or replace function public.lookup_family_member_user(target_user_id uuid)
returns table(
  id uuid,
  email text,
  display_name text,
  avatar_url text,
  delegated_by_user_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    u.id,
    u.email,
    u.display_name,
    u.avatar_url,
    u.delegated_by_user_id,
    u.created_at,
    u.updated_at
  from public.users u
  where u.id = target_user_id
    and (
      -- the caller is reading their own record
      u.id = (select auth.uid())
      -- the caller is the parent of this delegated user
      or u.delegated_by_user_id = (select auth.uid())
      -- the caller shares a family with the target user
      or exists (
        select 1
        from public.family_members fm1
        join public.family_members fm2 on fm1.family_id = fm2.family_id
        where fm1.user_id = (select auth.uid())
          and fm2.user_id = target_user_id
      )
    )
  limit 1;
$$;
