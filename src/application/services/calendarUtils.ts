import type { Event } from "@/domain/entities/Event";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import type { RecurringEventCategory } from "@/domain/entities/RecurringEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { EventFrequencyUnit } from "@/domain/value-objects/EventFrequency";
import type { ShiftTypeValue } from "@/domain/value-objects/ShiftType";
import { ShiftType } from "@/domain/value-objects/ShiftType";

// ---------------------------------------------------------------------------
// Serialized types (safe to pass from Server Components to Client Components)
// ---------------------------------------------------------------------------

export interface SerializedPunctualEvent {
  type: "punctual";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  startTime: string | null;
  endTime: string | null;
}

export interface SerializedRecurringEvent {
  type: "recurring";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  category: RecurringEventCategory;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD | null */
  endDate: string | null;
  frequencyUnit: EventFrequencyUnit;
  frequencyInterval: number;
  shiftType: ShiftTypeValue | null;
}

export type SerializedEvent =
  | SerializedPunctualEvent
  | SerializedRecurringEvent;

export interface SerializedMember {
  userId: string;
  displayName: string;
  colorPaletteName: ColorPaletteName | null;
}

// ---------------------------------------------------------------------------
// Calendar occurrence – one event on one specific date
// ---------------------------------------------------------------------------

export interface CalendarOccurrence {
  eventId: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  type: "punctual" | "recurring";
  category: RecurringEventCategory | null;
  shiftType: ShiftTypeValue | null;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the UTC calendar date as YYYY-MM-DD. */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses a YYYY-MM-DD string to UTC midnight. */
function parseUTCDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(Date.UTC(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1));
}

function advanceDate(
  date: Date,
  unit: EventFrequencyUnit,
  interval: number,
): Date {
  const next = new Date(date);

  if (unit === "daily") {
    next.setUTCDate(next.getUTCDate() + interval);
  } else if (unit === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7 * interval);
  } else {
    next.setUTCFullYear(next.getUTCFullYear() + interval);
  }

  return next;
}

function getRecurringDatesInRange(
  event: SerializedRecurringEvent,
  rangeStart: Date,
  rangeEnd: Date,
): string[] {
  const startDate = parseUTCDate(event.startDate);
  const endDate = event.endDate ? parseUTCDate(event.endDate) : null;
  const { frequencyUnit, frequencyInterval } = event;
  const dates: string[] = [];

  let current = new Date(startDate);

  // Fast-skip: jump as close to rangeStart as possible before iterating
  const diff = rangeStart.getTime() - current.getTime();

  if (diff > 0) {
    if (frequencyUnit === "daily") {
      const steps = Math.floor(diff / (frequencyInterval * 86_400_000));
      current.setUTCDate(current.getUTCDate() + steps * frequencyInterval);
    } else if (frequencyUnit === "weekly") {
      const steps = Math.floor(diff / (frequencyInterval * 7 * 86_400_000));
      current.setUTCDate(current.getUTCDate() + steps * frequencyInterval * 7);
    } else {
      // annual
      const yearDiff = rangeStart.getUTCFullYear() - startDate.getUTCFullYear();
      const steps = Math.max(0, Math.floor(yearDiff / frequencyInterval));
      current.setUTCFullYear(
        current.getUTCFullYear() + steps * frequencyInterval,
      );
    }
  }

  while (current <= rangeEnd) {
    if (endDate && current > endDate) break;

    if (current >= rangeStart) {
      dates.push(toDateString(current));
    }

    const next = advanceDate(current, frequencyUnit, frequencyInterval);

    // Guard against infinite loop if the date does not advance
    if (next.getTime() === current.getTime()) break;
    current = next;
  }

  return dates;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Converts a domain Event entity to a plain, JSON-serializable object that is
 * safe to pass from a Next.js Server Component to a Client Component.
 */
export function serializeEvent(event: Event): SerializedEvent {
  if (event instanceof PunctualEvent) {
    return {
      type: "punctual",
      id: event.id,
      familyId: event.familyId,
      createdBy: event.createdBy,
      title: event.title,
      date: toDateString(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
    };
  }

  if (event instanceof RecurringEvent) {
    return {
      type: "recurring",
      id: event.id,
      familyId: event.familyId,
      createdBy: event.createdBy,
      title: event.title,
      category: event.category,
      startDate: toDateString(event.startDate),
      endDate: event.endDate ? toDateString(event.endDate) : null,
      frequencyUnit: event.frequency.unit,
      frequencyInterval: event.frequency.interval,
      shiftType: event.shiftType?.value ?? null,
    };
  }

  throw new TypeError("Unsupported event type");
}

/**
 * Expands a list of serialized events into individual occurrences that fall
 * within the specified calendar month.
 *
 * @param events - Serialized events from any source (server action, mock, etc.)
 * @param year   - Full year, e.g. 2026
 * @param month  - 1-indexed month (1 = January … 12 = December)
 */
export function getOccurrencesForMonth(
  events: SerializedEvent[],
  year: number,
  month: number,
): CalendarOccurrence[] {
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 0)); // last day of the month
  const monthStartStr = toDateString(rangeStart);
  const monthEndStr = toDateString(rangeEnd);
  const occurrences: CalendarOccurrence[] = [];

  for (const event of events) {
    if (event.type === "punctual") {
      if (event.date >= monthStartStr && event.date <= monthEndStr) {
        occurrences.push({
          eventId: event.id,
          date: event.date,
          title: event.title,
          type: "punctual",
          category: null,
          shiftType: null,
          createdBy: event.createdBy,
        });
      }
    } else {
      const dates = getRecurringDatesInRange(event, rangeStart, rangeEnd);

      for (const date of dates) {
        occurrences.push({
          eventId: event.id,
          date,
          title: event.title,
          type: "recurring",
          category: event.category,
          shiftType: event.shiftType,
          createdBy: event.createdBy,
        });
      }
    }
  }

  return occurrences;
}

/**
 * Resolves the hex color for a shift on a member's palette.
 * Returns null when either argument is absent or invalid.
 */
export function getShiftColor(
  paletteName: string | null,
  shiftType: string | null,
): string | null {
  if (!paletteName || !shiftType) return null;

  try {
    const palette = ColorPalette.create(paletteName);
    const shift = ShiftType.create(shiftType);
    return palette.getToneFor(shift);
  } catch {
    return null;
  }
}
