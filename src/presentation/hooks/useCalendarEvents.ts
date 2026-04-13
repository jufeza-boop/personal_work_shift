"use client";

import { useMemo, useState } from "react";
import type {
  CalendarOccurrence,
  SerializedEvent,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { getOccurrencesForMonth } from "@/application/services/calendarUtils";

interface UseCalendarEventsOptions {
  events: SerializedEvent[];
  members: SerializedMember[];
  initialYear: number;
  initialMonth: number;
}

interface UseCalendarEventsResult {
  year: number;
  month: number;
  navigate: (delta: number) => void;
  visibleOccurrences: CalendarOccurrence[];
  occurrencesByDate: Map<string, CalendarOccurrence[]>;
  visibleMembers: SerializedMember[];
  hiddenMemberIds: Set<string>;
  toggleMember: (userId: string) => void;
}

export function useCalendarEvents({
  events,
  members,
  initialYear,
  initialMonth,
}: UseCalendarEventsOptions): UseCalendarEventsResult {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [hiddenMemberIds, setHiddenMemberIds] = useState<Set<string>>(
    new Set(),
  );

  const navigate = (delta: number) => {
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth() + 1);
  };

  const toggleMember = (userId: string) => {
    setHiddenMemberIds((prev) => {
      const visibleCount = members.filter((m) => !prev.has(m.userId)).length;

      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        // At least one member must remain visible
        if (visibleCount <= 1) return prev;
        next.add(userId);
      }
      return next;
    });
  };

  const visibleMembers = members.filter((m) => !hiddenMemberIds.has(m.userId));

  const allOccurrences = useMemo(
    () => getOccurrencesForMonth(events, year, month),
    [events, year, month],
  );

  const visibleOccurrences = useMemo(
    () =>
      allOccurrences.filter(
        (o) => !hiddenMemberIds.has(o.createdBy),
      ),
    [allOccurrences, hiddenMemberIds],
  );

  const occurrencesByDate = useMemo(() => {
    const map = new Map<string, CalendarOccurrence[]>();
    for (const occ of visibleOccurrences) {
      const existing = map.get(occ.date) ?? [];
      existing.push(occ);
      map.set(occ.date, existing);
    }
    return map;
  }, [visibleOccurrences]);

  return {
    year,
    month,
    navigate,
    visibleOccurrences,
    occurrencesByDate,
    visibleMembers,
    hiddenMemberIds,
    toggleMember,
  };
}
