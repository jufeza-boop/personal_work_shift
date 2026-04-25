-- Migration: Phase 15 - Family Invitations (shareable join links)
-- Creates the family_invitations table with states: active, used, expired, cancelled

create table if not exists public.family_invitations (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  family_name text not null,
  created_by  uuid not null references public.users(id) on delete cascade,
  token       uuid not null unique default gen_random_uuid(),
  status      text not null default 'active'
                check (status in ('active', 'used', 'expired', 'cancelled')),
  expires_at  timestamptz not null,
  used_by     uuid references public.users(id) on delete set null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- Indexes for common lookup patterns
create index if not exists family_invitations_token_idx
  on public.family_invitations (token);

create index if not exists family_invitations_family_id_idx
  on public.family_invitations (family_id);

create index if not exists family_invitations_status_idx
  on public.family_invitations (status)
  where status = 'active';

-- Enable RLS
alter table public.family_invitations enable row level security;

-- Owner can create invitations for their own families
create policy family_invitations_insert_owner
  on public.family_invitations
  for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.families
      where id = family_id and created_by = auth.uid()
    )
  );

-- Owner can read all invitations for their families
create policy family_invitations_select_owner
  on public.family_invitations
  for select
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.families
      where id = family_invitations.family_id and created_by = auth.uid()
    )
  );

-- Anyone authenticated can read an invitation by token
-- (needed for the join flow before the user is a family member)
create policy family_invitations_select_by_token
  on public.family_invitations
  for select
  using (auth.uid() is not null);

-- Owner can update (cancel) invitations for their families
create policy family_invitations_update_owner
  on public.family_invitations
  for update
  using (
    exists (
      select 1 from public.families
      where id = family_invitations.family_id and created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.families
      where id = family_invitations.family_id and created_by = auth.uid()
    )
  );

-- Authenticated user can update (mark as used) an active invitation they are accepting
create policy family_invitations_update_accept
  on public.family_invitations
  for update
  using (auth.uid() is not null and status = 'active')
  with check (auth.uid() is not null);

-- Owner can delete invitations for their families
create policy family_invitations_delete_owner
  on public.family_invitations
  for delete
  using (
    exists (
      select 1 from public.families
      where id = family_invitations.family_id and created_by = auth.uid()
    )
  );
