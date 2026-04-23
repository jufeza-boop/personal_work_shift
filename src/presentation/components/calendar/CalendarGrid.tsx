"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SerializedEvent,
  SerializedEventException,
  SerializedMember,
} from "@/application/services/calendarUtils";
import type { PendingOperation } from "@/application/services/IOfflineQueue";
import { OfflineQueueStore } from "@/infrastructure/offline/OfflineQueueStore";
import { SupabaseRealtimeService } from "@/infrastructure/realtime/SupabaseRealtimeService";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/browser";
import { DayCell } from "@/presentation/components/calendar/DayCell";
import { DayDetailPanel } from "@/presentation/components/calendar/DayDetailPanel";
import { MemberToggle } from "@/presentation/components/calendar/MemberToggle";
import { OfflineBanner } from "@/presentation/components/ui/OfflineBanner";
import type {
  EventFormAction,
  EventFormState,
} from "@/presentation/components/events/types";
import { EMPTY_EVENT_FORM_STATE } from "@/presentation/components/events/types";
import { useCalendarEvents } from "@/presentation/hooks/useCalendarEvents";
import { useOfflineSync } from "@/presentation/hooks/useOfflineSync";
import { useRealtimeSync } from "@/presentation/hooks/useRealtimeSync";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const DAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

interface CalendarGridProps {
  initialEvents: SerializedEvent[];
  initialExceptions: SerializedEventException[];
  members: SerializedMember[];
  initialYear: number;
  initialMonth: number;
  currentUserId: string;
  delegatedUsers?: { id: string; displayName: string }[];
  familyId: string;
  createAction: EventFormAction;
  deleteAction: EventFormAction;
}

export function CalendarGrid({
  initialEvents,
  initialExceptions,
  members,
  initialYear,
  initialMonth,
  currentUserId,
  delegatedUsers = [],
  familyId,
  createAction,
  deleteAction,
}: CalendarGridProps) {
  const [events, setEvents] = useState<SerializedEvent[]>(initialEvents);
  const [exceptions, setExceptions] =
    useState<SerializedEventException[]>(initialExceptions);

  // Sync exceptions when props change (e.g., after redirect/revalidation)
  useEffect(() => {
    setExceptions(initialExceptions);
  }, [initialExceptions]);

  const [offlineQueue] = useState(() => new OfflineQueueStore());

  const processOperation = useCallback(
    async (op: PendingOperation) => {
      const formData = new FormData();
      Object.entries(op.formFields).forEach(([k, v]) => formData.append(k, v));
      if (op.type === "create_event") {
        const result = await createAction(EMPTY_EVENT_FORM_STATE, formData);
        if (!result.success && result.message) throw new Error(result.message);
      } else if (op.type === "delete_event") {
        const result = await deleteAction(EMPTY_EVENT_FORM_STATE, formData);
        if (!result.success && result.message) throw new Error(result.message);
      }
    },
    [createAction, deleteAction],
  );

  const { isOnline, pendingCount, isSyncing, enqueueOperation } =
    useOfflineSync({ queue: offlineQueue, processOperation });

  const offlineCreateAction = useCallback(
    async (
      prevState: EventFormState,
      formData: FormData,
    ): Promise<EventFormState> => {
      if (isOnline) return createAction(prevState, formData);
      const formFields: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (typeof value === "string") formFields[key] = value;
      });
      await enqueueOperation({ type: "create_event", formFields });
      return {
        success: true,
        message: "Guardado sin conexión. Se sincronizará automáticamente.",
      };
    },
    [isOnline, createAction, enqueueOperation],
  );

  const offlineDeleteAction = useCallback(
    async (
      prevState: EventFormState,
      formData: FormData,
    ): Promise<EventFormState> => {
      if (isOnline) return deleteAction(prevState, formData);
      const formFields: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (typeof value === "string") formFields[key] = value;
      });
      await enqueueOperation({ type: "delete_event", formFields });
      return {
        success: true,
        message: "Guardado sin conexión. Se sincronizará automáticamente.",
      };
    },
    [isOnline, deleteAction, enqueueOperation],
  );

  const realtimeService = useMemo(
    () => new SupabaseRealtimeService(createBrowserSupabaseClient()),
    [],
  );

  useRealtimeSync({
    familyId,
    onDelete: (eventId) =>
      setEvents((prev) => prev.filter((e) => e.id !== eventId)),
    onInsert: (event) => setEvents((prev) => [...prev, event]),
    onUpdate: (event) =>
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e))),
    service: realtimeService,
  });

  const {
    year,
    month,
    navigate,
    occurrencesByDate,
    visibleMembers,
    hiddenMemberIds,
    toggleMember,
  } = useCalendarEvents({
    events,
    exceptions,
    members,
    initialYear,
    initialMonth,
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todayYear = Number(today.slice(0, 4));
  const todayMonth = Number(today.slice(5, 7));
  const todayDay = Number(today.slice(8, 10));

  // Build grid cells: leading empty slots + days of month
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // getUTCDay() returns 0=Sun..6=Sat; convert to Monday-first: Mon=0..Sun=6
  const rawDow = firstDayOfMonth.getUTCDay();
  const leadingOffset = (rawDow + 6) % 7;

  const totalCells = leadingOffset + daysInMonth;
  const totalRows = Math.ceil(totalCells / 7);

  const selectedDay = selectedDate ? Number(selectedDate.slice(8, 10)) : null;
  const selectedOccurrences = selectedDate
    ? (occurrencesByDate.get(selectedDate) ?? [])
    : [];

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 sm:p-3">
      {/* Offline status banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
      />

      {/* Month navigation */}
      <div className="flex items-center justify-between gap-4 px-1">
        <button
          type="button"
          onClick={() => {
            navigate(-1);
            setSelectedDate(null);
          }}
          aria-label="Mes anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
        >
          ‹
        </button>

        <h3 className="text-base font-bold tracking-wide text-slate-900 uppercase sm:text-lg">
          {MONTH_NAMES[month - 1]} {year}
        </h3>

        <button
          type="button"
          onClick={() => {
            navigate(1);
            setSelectedDate(null);
          }}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
        >
          ›
        </button>
      </div>

      {/* Member toggles */}
      {members.length > 0 && (
        <MemberToggle
          members={members}
          hiddenMemberIds={hiddenMemberIds}
          onToggle={toggleMember}
        />
      )}

      {/* Calendar grid */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {DAY_HEADERS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-semibold tracking-wide text-slate-400 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: totalRows * 7 }, (_, i) => {
            const dayNumber = i - leadingOffset + 1;
            const isInMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

            if (!isInMonth) {
              return (
                <div
                  key={i}
                  className="min-h-[5.5rem] rounded-lg bg-stone-50/60 sm:min-h-[6.5rem]"
                />
              );
            }

            const dateStr = `${String(year)}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
            const isToday =
              year === todayYear &&
              month === todayMonth &&
              dayNumber === todayDay;
            const occs = occurrencesByDate.get(dateStr) ?? [];

            return (
              <DayCell
                key={dateStr}
                day={dayNumber}
                dateStr={dateStr}
                isToday={isToday}
                isSelected={selectedDate === dateStr}
                occurrences={occs}
                members={visibleMembers}
                onSelect={setSelectedDate}
              />
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate && selectedDay !== null && (
        <DayDetailPanel
          date={selectedDate}
          day={selectedDay}
          month={month}
          year={year}
          occurrences={selectedOccurrences}
          members={visibleMembers}
          currentUserId={currentUserId}
          delegatedUsers={delegatedUsers}
          familyId={familyId}
          createAction={offlineCreateAction}
          deleteAction={offlineDeleteAction}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
