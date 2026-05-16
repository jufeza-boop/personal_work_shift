import type { Event } from "@/domain/entities/Event";
import type { EventException } from "@/domain/entities/EventException";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import {
  RecurringEvent,
  type EventCategory,
} from "@/domain/entities/RecurringEvent";
import {
  ColorPalette,
  type ColorPaletteName,
} from "@/domain/value-objects/ColorPalette";
import type { EventFrequencyUnit } from "@/domain/value-objects/EventFrequency";
import {
  ShiftType,
  type ShiftTypeValue,
} from "@/domain/value-objects/ShiftType";

// ---------------------------------------------------------------------------
// Serialized types (safe to pass from Server Components to Client Components)
// ---------------------------------------------------------------------------

export interface SerializedPunctualEvent {
  type: "punctual";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  description: string | null;
  /** YYYY-MM-DD */
  date: string;
  startTime: string | null;
  endTime: string | null;
  category: EventCategory | null;
  shiftType: ShiftTypeValue | null;
}

export interface SerializedRecurringEvent {
  type: "recurring";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  description: string | null;
  category: EventCategory;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD | null */
  endDate: string | null;
  frequencyUnit: EventFrequencyUnit;
  frequencyInterval: number;
  shiftType: ShiftTypeValue | null;
  startTime: string | null;
  endTime: string | null;
}

export type SerializedEvent =
  | SerializedPunctualEvent
  | SerializedRecurringEvent;

export interface SerializedMember {
  userId: string;
  displayName: string;
  colorPaletteName: ColorPaletteName | null;
}

export interface SerializedEventException {
  eventId: string;
  /** YYYY-MM-DD */
  exceptionDate: string;
  isDeleted: boolean;
  overrideData?: { newDate?: string } | null;
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
  category: EventCategory | null;
  shiftType: ShiftTypeValue | null;
  createdBy: string;
  description: string | null;
  /** HH:MM or null */
  startTime: string | null;
  /** HH:MM or null */
  endTime: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Milliseconds in one calendar day (UTC). */
const MS_PER_DAY = 86_400_000;

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
      const steps = Math.floor(diff / (frequencyInterval * MS_PER_DAY));
      current.setUTCDate(current.getUTCDate() + steps * frequencyInterval);
    } else if (frequencyUnit === "weekly") {
      const steps = Math.floor(diff / (frequencyInterval * 7 * MS_PER_DAY));
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
      description: event.description,
      date: toDateString(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      shiftType: event.shiftType?.value ?? null,
    };
  }

  if (event instanceof RecurringEvent) {
    return {
      type: "recurring",
      id: event.id,
      familyId: event.familyId,
      createdBy: event.createdBy,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: toDateString(event.startDate),
      endDate: event.endDate ? toDateString(event.endDate) : null,
      frequencyUnit: event.frequency.unit,
      frequencyInterval: event.frequency.interval,
      shiftType: event.shiftType?.value ?? null,
      startTime: event.startTime,
      endTime: event.endTime,
    };
  }

  throw new TypeError("Unsupported event type");
}

/**
 * Converts a domain EventException entity to a plain, JSON-serializable object.
 */
export function serializeException(
  exception: EventException,
): SerializedEventException {
  return {
    eventId: exception.eventId,
    exceptionDate: toDateString(exception.exceptionDate),
    isDeleted: exception.isDeleted,
    overrideData: exception.overrideData ?? null,
  };
}

function buildOccurrenceFromEvent(
  event: SerializedEvent,
  date: string,
): CalendarOccurrence {
  return {
    eventId: event.id,
    date,
    title: event.title,
    type: event.type,
    category: event.category,
    shiftType: event.shiftType,
    createdBy: event.createdBy,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
  };
}

function collectMovedOccurrences(
  exceptions: SerializedEventException[],
  eventMap: Map<string, SerializedEvent>,
  monthStartStr: string,
  monthEndStr: string,
): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = [];

  for (const ex of exceptions) {
    const newDate = ex.overrideData?.newDate;
    if (ex.isDeleted || !newDate) continue;

    if (newDate < monthStartStr || newDate > monthEndStr) continue;

    const event = eventMap.get(ex.eventId);
    if (event?.type === "recurring") {
      occurrences.push(buildOccurrenceFromEvent(event, newDate));
    }
  }

  return occurrences;
}

function collectRecurringOccurrencesForEvent(
  event: SerializedRecurringEvent,
  rangeStart: Date,
  rangeEnd: Date,
  suppressed: Set<string>,
): CalendarOccurrence[] {
  const dates = getRecurringDatesInRange(event, rangeStart, rangeEnd);
  const occurrences: CalendarOccurrence[] = [];

  for (const date of dates) {
    if (!suppressed.has(`${event.id}:${date}`)) {
      occurrences.push(buildOccurrenceFromEvent(event, date));
    }
  }

  return occurrences;
}

/**
 * Expands a list of serialized events into individual occurrences that fall
 * within the specified calendar month, filtering out deleted exceptions.
 *
 * @param events - Serialized events from any source (server action, mock, etc.)
 * @param year   - Full year, e.g. 2026
 * @param month  - 1-indexed month (1 = January … 12 = December)
 * @param exceptions - Serialized event exceptions to filter out deleted occurrences
 */
export function getOccurrencesForMonth(
  events: SerializedEvent[],
  year: number,
  month: number,
  exceptions: SerializedEventException[] = [],
): CalendarOccurrence[] {
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 0)); // last day of the month
  const monthStartStr = toDateString(rangeStart);
  const monthEndStr = toDateString(rangeEnd);

  // Suppress original dates for deleted or moved occurrences: "eventId:date"
  const suppressedOccurrences = new Set(
    exceptions
      .filter((ex) => ex.isDeleted || ex.overrideData?.newDate)
      .map((ex) => `${ex.eventId}:${ex.exceptionDate}`),
  );

  // Build event map for quick lookup when resolving moved occurrences
  const eventMap = new Map(events.map((e) => [e.id, e]));

  const occurrences: CalendarOccurrence[] = collectMovedOccurrences(
    exceptions,
    eventMap,
    monthStartStr,
    monthEndStr,
  );

  for (const event of events) {
    if (event.type === "punctual") {
      if (event.date >= monthStartStr && event.date <= monthEndStr) {
        occurrences.push(buildOccurrenceFromEvent(event, event.date));
      }
    } else {
      occurrences.push(
        ...collectRecurringOccurrencesForEvent(
          event,
          rangeStart,
          rangeEnd,
          suppressedOccurrences,
        ),
      );
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

/**
 * Returns the lightest (morning) tone for a palette, used as the stripe color
 * for vacation events. Returns null when the palette name is absent or invalid.
 */
export function getVacationColor(paletteName: string | null): string | null {
  if (!paletteName) return null;

  try {
    const palette = ColorPalette.create(paletteName);
    return palette.getLightestTone();
  } catch {
    return null;
  }
}
export function getBaseColor(paletteName: string | null): string | null {
  if (!paletteName) return null;

  try {
    const palette = ColorPalette.create(paletteName);
    return palette.getToneFor(ShiftType.create("afternoon"));
  } catch {
    return null;
  }
}
