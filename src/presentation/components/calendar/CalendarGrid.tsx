"use client";

import type {
  SerializedEvent,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { DayCell } from "@/presentation/components/calendar/DayCell";
import { MemberToggle } from "@/presentation/components/calendar/MemberToggle";
import { useCalendarEvents } from "@/presentation/hooks/useCalendarEvents";

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
  events: SerializedEvent[];
  members: SerializedMember[];
  initialYear: number;
  initialMonth: number;
}

export function CalendarGrid({
  events,
  members,
  initialYear,
  initialMonth,
}: CalendarGridProps) {
  const {
    year,
    month,
    navigate,
    occurrencesByDate,
    visibleMembers,
    hiddenMemberIds,
    toggleMember,
  } = useCalendarEvents({ events, members, initialYear, initialMonth });

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

  return (
    <div className="space-y-4">
      {/* Header row: navigation + month label */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
        >
          ‹
        </button>

        <h3 className="text-lg font-semibold text-slate-900">
          {MONTH_NAMES[month - 1]} {year}
        </h3>

        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
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
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {DAY_HEADERS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium text-slate-400"
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
                  className="min-h-[5rem] rounded-lg bg-stone-50/60"
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
                isToday={isToday}
                occurrences={occs}
                members={visibleMembers}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
