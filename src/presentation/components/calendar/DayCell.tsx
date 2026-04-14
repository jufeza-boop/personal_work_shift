import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import {
  getBaseColor,
  getShiftColor,
} from "@/application/services/calendarUtils";
import { ShiftBlock } from "@/presentation/components/calendar/ShiftBlock";

interface DayCellProps {
  day: number;
  dateStr: string;
  isToday: boolean;
  occurrences: CalendarOccurrence[];
  /** Visible members, used to resolve colors */
  members: SerializedMember[];
  /** Called when user clicks the day cell */
  onSelect: (dateStr: string) => void;
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function DayCell({
  day,
  dateStr,
  isToday,
  occurrences,
  members,
  onSelect,
}: DayCellProps) {
  const memberMap = new Map(members.map((m) => [m.userId, m]));

  // Shift occurrences: recurring work/studies events
  const shiftOccurrences = occurrences.filter(
    (o) =>
      o.type === "recurring" &&
      (o.category === "work" || o.category === "studies") &&
      o.shiftType !== null,
  );

  // Punctual events: shown as neutral text labels
  const punctualOccurrences = occurrences.filter((o) => o.type === "punctual");

  // Other recurring events: shown as colored text labels
  const otherOccurrences = occurrences.filter(
    (o) => o.type === "recurring" && o.category === "other",
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(dateStr)}
      aria-label={`${day}`}
      className={[
        "flex min-h-[5rem] cursor-pointer flex-col gap-0.5 overflow-hidden rounded-lg p-1 text-left text-xs transition-colors",
        isToday
          ? "bg-blue-50 ring-1 ring-blue-300"
          : "bg-white hover:bg-stone-50",
      ].join(" ")}
    >
      {/* Day number */}
      <span
        className={[
          "self-end rounded-full px-1 text-[11px] leading-5 font-medium",
          isToday ? "bg-blue-600 text-white" : "text-slate-500",
        ].join(" ")}
      >
        {day}
      </span>

      {/* Shift blocks – split horizontally */}
      {shiftOccurrences.length > 0 && (
        <div className="flex flex-row gap-px overflow-hidden rounded">
          {shiftOccurrences.map((occ) => {
            const member = memberMap.get(occ.createdBy);
            const color =
              getShiftColor(member?.colorPaletteName ?? null, occ.shiftType) ??
              "#CBD5E1";
            const label = member
              ? getInitials(member.displayName)
              : occ.createdBy.slice(0, 2).toUpperCase();

            return (
              <ShiftBlock
                key={`${occ.eventId}-${occ.date}`}
                color={color}
                label={label}
              />
            );
          })}
        </div>
      )}

      {/* Colored text labels for "other" recurring events */}
      {otherOccurrences.map((occ) => {
        const member = memberMap.get(occ.createdBy);
        const bgColor = getBaseColor(member?.colorPaletteName ?? null);

        return (
          <span
            key={`${occ.eventId}-${occ.date}`}
            className="truncate rounded px-1 py-px text-[10px] leading-4 text-slate-700"
            style={bgColor ? { backgroundColor: bgColor } : undefined}
            title={occ.title}
          >
            {occ.title}
          </span>
        );
      })}

      {/* Neutral text labels for punctual events */}
      {punctualOccurrences.map((occ) => (
        <span
          key={`${occ.eventId}-${occ.date}`}
          className="truncate rounded bg-stone-100 px-1 py-px text-[10px] leading-4 text-slate-700"
          title={occ.title}
        >
          {occ.title}
        </span>
      ))}
    </button>
  );
}
