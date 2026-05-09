-- Add 'vacations' value to the recurring_event_category enum.
-- Important: this migration must only alter the enum.
-- Any constraint/table changes that reference 'vacations' must be applied in a
-- later migration to avoid SQLSTATE 55P04 when migrations run in a transaction.
alter type public.recurring_event_category add value if not exists 'vacations';
