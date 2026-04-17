-- Phase 12: Push Subscriptions
-- Stores Web Push API subscriptions for sending push notifications.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  keys_auth text not null,
  keys_p256dh text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- Indexes
create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

-- RLS
alter table public.push_subscriptions enable row level security;

-- Users can only manage their own subscriptions
create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Server-side service role can read subscriptions to send notifications
-- (service_role bypasses RLS by default, so no extra policy needed)
