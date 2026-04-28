-- Migration: Fix push subscriptions RLS for family notifications
--
-- Problem:
-- The push_subscriptions_select_own policy only allowed users to read their
-- own subscriptions. When the backend (acting as the authenticated user)
-- attempted to fetch endpoints for family members to send event notifications,
-- RLS blocked the read, silently returning an empty array.
--
-- Fix:
-- Replace the restrictive policy with one that allows users to read their own
-- subscriptions AND the subscriptions of other users who share at least one
-- family with them via the public.family_members table.

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;

create policy push_subscriptions_select_family
  on public.push_subscriptions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or user_id in (
      select fm_other.user_id
      from public.family_members fm_me
      join public.family_members fm_other on fm_me.family_id = fm_other.family_id
      where fm_me.user_id = auth.uid()
    )
  );