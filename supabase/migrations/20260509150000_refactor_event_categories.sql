-- Add 'vacations' value to the recurring_event_category enum.
-- We keep the enum name for backward compatibility with existing infrastructure
-- and just add the new value.
alter type public.recurring_event_category add value if not exists 'vacations';

-- Drop the old shape constraint and replace it with one that:
--   1. Allows punctual events to optionally carry category + shift_type.
--   2. Permits the new 'vacations' category (no shift_type required/allowed).
--   3. Keeps recurring events requiring a category.
alter table public.events drop constraint if exists events_shape_valid;

alter table public.events add constraint events_shape_valid check (
  (
    -- Punctual: has event_date, no recurrence columns, optional category/shift_type
    event_type = 'punctual'
    and event_date is not null
    and start_date is null
    and end_date is null
    and frequency_unit is null
    and frequency_interval is null
    and (
      category is null
      or (category in ('other', 'vacations') and shift_type is null)
      or (category in ('work', 'studies') and shift_type is not null)
    )
  )
  or (
    -- Recurring: has recurrence columns, no event_date, category required
    event_type = 'recurring'
    and event_date is null
    and start_date is not null
    and frequency_unit is not null
    and frequency_interval is not null
    and (end_date is null or end_date >= start_date)
    and category is not null
    and (
      (category in ('other', 'vacations') and shift_type is null)
      or (category in ('work', 'studies') and shift_type is not null)
    )
  )
);
