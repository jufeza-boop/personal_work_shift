-- Fix: allow multiple family members to have no color palette (null).
--
-- The original constraint used NULLS NOT DISTINCT which treated NULLs as
-- equal, so only one member per family could have no palette assigned.
-- Replaced with a partial unique index that only enforces uniqueness when
-- color_palette IS NOT NULL, allowing multiple uncolored members per family.

alter table public.family_members
  drop constraint if exists family_members_unique_palette;

create unique index family_members_unique_palette
  on public.family_members (family_id, color_palette)
  where color_palette is not null;
