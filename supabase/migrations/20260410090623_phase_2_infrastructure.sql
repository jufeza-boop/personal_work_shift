create type public.family_member_role as enum ('owner', 'member', 'delegated');
create type public.event_type as enum ('punctual', 'recurring');
create type public.recurring_event_category as enum ('work', 'studies', 'other');
create type public.shift_type as enum ('morning', 'day', 'afternoon', 'night');
create type public.event_frequency_unit as enum ('daily', 'weekly', 'annual');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  delegated_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_email_not_blank check (char_length(trim(email)) > 0),
  constraint users_display_name_not_blank check (char_length(trim(display_name)) > 0)
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint families_name_length check (char_length(trim(name)) between 1 and 100)
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.family_member_role not null,
  color_palette text,
  delegated_by_user_id uuid references public.users (id) on delete set null,
  joined_at timestamptz not null default timezone('utc', now()),
  constraint family_members_unique_user unique (family_id, user_id),
  constraint family_members_unique_palette unique nulls not distinct (family_id, color_palette),
  constraint family_members_color_palette_valid check (
    color_palette is null
    or color_palette in ('sky', 'rose', 'violet', 'emerald', 'amber', 'coral', 'slate', 'teal')
  ),
  constraint family_members_delegation_valid check (
    (
      role = 'delegated'
      and delegated_by_user_id is not null
      and delegated_by_user_id <> user_id
    )
    or (role in ('owner', 'member') and delegated_by_user_id is null)
  )
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  created_by uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  event_type public.event_type not null,
  category public.recurring_event_category,
  shift_type public.shift_type,
  event_date date,
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  frequency_unit public.event_frequency_unit,
  frequency_interval integer,
  parent_event_id uuid references public.events (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint events_title_length check (char_length(trim(title)) between 1 and 200),
  constraint events_time_range_valid check (
    end_time is null or (start_time is not null and end_time > start_time)
  ),
  constraint events_recurring_interval_valid check (
    frequency_interval is null or frequency_interval > 0
  ),
  constraint events_shape_valid check (
    (
      event_type = 'punctual'
      and event_date is not null
      and category is null
      and shift_type is null
      and start_date is null
      and end_date is null
      and frequency_unit is null
      and frequency_interval is null
    )
    or (
      event_type = 'recurring'
      and event_date is null
      and category is not null
      and start_date is not null
      and frequency_unit is not null
      and frequency_interval is not null
      and (end_date is null or end_date >= start_date)
      and (
        (category = 'other' and shift_type is null)
        or (category in ('work', 'studies') and shift_type is not null)
      )
    )
  )
);

create table public.event_exceptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  exception_date date not null,
  is_deleted boolean not null default false,
  override_data jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint event_exceptions_unique_date unique (event_id, exception_date),
  constraint event_exceptions_override_data_object check (
    override_data is null or jsonb_typeof(override_data) = 'object'
  )
);

create index users_delegated_by_user_id_idx on public.users (delegated_by_user_id);
create index families_created_by_idx on public.families (created_by);
create index family_members_family_id_idx on public.family_members (family_id);
create index family_members_user_id_idx on public.family_members (user_id);
create index family_members_delegated_by_user_id_idx on public.family_members (delegated_by_user_id);
create index events_family_id_created_at_idx on public.events (family_id, created_at desc);
create index events_created_by_idx on public.events (created_by);
create index events_parent_event_id_idx on public.events (parent_event_id);
create index events_punctual_lookup_idx on public.events (family_id, event_date)
where event_type = 'punctual';
create index events_recurring_lookup_idx on public.events (family_id, start_date, end_date)
where event_type = 'recurring';
create index event_exceptions_event_id_idx on public.event_exceptions (event_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  normalized_display_name text;
  normalized_avatar_url text;
  delegated_by_value uuid;
begin
  normalized_email := lower(trim(new.email));
  normalized_display_name := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    split_part(normalized_email, '@', 1)
  );
  normalized_avatar_url := nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '');
  delegated_by_value := nullif(new.raw_user_meta_data ->> 'delegated_by_user_id', '')::uuid;

  insert into public.users (
    id,
    email,
    display_name,
    avatar_url,
    delegated_by_user_id
  )
  values (
    new.id,
    normalized_email,
    normalized_display_name,
    normalized_avatar_url,
    delegated_by_value
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        delegated_by_user_id = excluded.delegated_by_user_id,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_family_owner(target_family_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

create or replace function public.is_family_user(
  target_family_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family_id
      and user_id = target_user_id
  );
$$;

create or replace function public.can_manage_user(target_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select
    (select auth.uid()) = target_user_id
    or exists (
      select 1
      from public.family_members
      where user_id = target_user_id
        and role = 'delegated'
        and delegated_by_user_id = (select auth.uid())
    );
$$;

create or replace function public.can_view_event(target_event_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.events
    where id = target_event_id
      and public.is_family_member(family_id)
  );
$$;

create or replace function public.can_manage_event(target_event_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.events
    where id = target_event_id
      and public.can_manage_user(created_by)
  );
$$;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger families_set_updated_at
before update on public.families
for each row
execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

create trigger on_auth_user_changed
after insert or update of email, raw_user_meta_data on auth.users
for each row
execute function public.handle_auth_user();

alter table public.users enable row level security;
alter table public.users force row level security;
alter table public.families enable row level security;
alter table public.families force row level security;
alter table public.family_members enable row level security;
alter table public.family_members force row level security;
alter table public.events enable row level security;
alter table public.events force row level security;
alter table public.event_exceptions enable row level security;
alter table public.event_exceptions force row level security;

create policy users_select_own
on public.users
for select
to authenticated
using ((select auth.uid()) = id);

create policy users_insert_own
on public.users
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy users_update_own
on public.users
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy families_select_member
on public.families
for select
to authenticated
using ((select public.is_family_member(id)));

create policy families_insert_creator
on public.families
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy families_update_owner
on public.families
for update
to authenticated
using ((select public.is_family_owner(id)))
with check ((select public.is_family_owner(id)));

create policy families_delete_owner
on public.families
for delete
to authenticated
using ((select public.is_family_owner(id)));

create policy family_members_select_member
on public.family_members
for select
to authenticated
using ((select public.is_family_member(family_id)));

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
    and exists (
      select 1
      from public.families
      where id = family_id
        and created_by = (select auth.uid())
    )
  )
);

create policy family_members_update_owner
on public.family_members
for update
to authenticated
using ((select public.is_family_owner(family_id)))
with check ((select public.is_family_owner(family_id)));

create policy family_members_delete_owner
on public.family_members
for delete
to authenticated
using ((select public.is_family_owner(family_id)));

create policy events_select_family
on public.events
for select
to authenticated
using ((select public.is_family_member(family_id)));

create policy events_insert_authorized
on public.events
for insert
to authenticated
with check (
  (select public.is_family_member(family_id))
  and (select public.is_family_user(family_id, created_by))
  and (select public.can_manage_user(created_by))
);

create policy events_update_authorized
on public.events
for update
to authenticated
using ((select public.can_manage_user(created_by)))
with check (
  (select public.is_family_member(family_id))
  and (select public.is_family_user(family_id, created_by))
  and (select public.can_manage_user(created_by))
);

create policy events_delete_authorized
on public.events
for delete
to authenticated
using ((select public.can_manage_user(created_by)));

create policy event_exceptions_select_family
on public.event_exceptions
for select
to authenticated
using ((select public.can_view_event(event_id)));

create policy event_exceptions_insert_authorized
on public.event_exceptions
for insert
to authenticated
with check ((select public.can_manage_event(event_id)));

create policy event_exceptions_update_authorized
on public.event_exceptions
for update
to authenticated
using ((select public.can_manage_event(event_id)))
with check ((select public.can_manage_event(event_id)));

create policy event_exceptions_delete_authorized
on public.event_exceptions
for delete
to authenticated
using ((select public.can_manage_event(event_id)));
