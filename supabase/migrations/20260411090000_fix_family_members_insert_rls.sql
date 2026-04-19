-- Fix 1: family_members_insert_owner policy fails for new families because
-- the inline `exists(... from public.families ...)` subquery is subject to
-- the families_select_member RLS policy, which requires the user to already
-- be a family member — creating a chicken-and-egg problem when bootstrapping
-- the owner membership.
--
-- Solution: introduce a SECURITY DEFINER helper that bypasses RLS to check
-- whether the current user created the family, and use it in the policy.

create or replace function public.is_family_creator(target_family_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.families
    where id = target_family_id
      and created_by = (select auth.uid())
  );
$$;

drop policy if exists family_members_insert_owner on public.family_members;

create policy family_members_insert_owner
on public.family_members
for insert
to authenticated
with check (
  (select public.is_family_owner(family_id))
  or (
    (select auth.uid()) = user_id
    and role = 'owner'
    and delegated_by_user_id is null
    and (select public.is_family_creator(family_id))
  )
);

-- Fix 2: users_select_own policy prevents family owners from looking up
-- other users by email when adding members. The lookup returns null because
-- RLS blocks access to rows where auth.uid() != id.
--
-- Solution: a SECURITY DEFINER function that bypasses RLS to find a user
-- by email, returning only the columns needed for the AddMember use case.

create or replace function public.lookup_user_by_email(target_email text)
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
  where u.email = lower(trim(target_email))
  limit 1;
$$;

-- Fix 3: users_select_own also prevents reading display names of fellow
-- family members (for the member list). We expose a SECURITY DEFINER
-- function that only returns users who share a family with the caller.

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
      u.id = (select auth.uid())
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
