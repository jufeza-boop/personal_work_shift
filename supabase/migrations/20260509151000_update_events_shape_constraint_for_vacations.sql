-- Recreate events shape constraint after enum value 'vacations' already exists.
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
