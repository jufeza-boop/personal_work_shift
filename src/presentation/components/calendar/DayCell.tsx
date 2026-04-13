import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { getShiftColor } from "@/application/services/calendarUtils";
import { ShiftBlock } from "@/presentation/components/calendar/ShiftBlock";

interface DayCellProps {
  day: number;
  isToday: boolean;
  occurrences: CalendarOccurrence[];
  /** Visible members, used to resolve colors */
  members: SerializedMember[];
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function DayCell({ day, isToday, occurrences, members }: DayCellProps) {
  const memberMap = new Map(members.map((m) => [m.userId, m]));

  // Shift occurrences: recurring work/studies events
  const shiftOccurrences = occurrences.filter(
    (o) =>
      o.type === "recurring" &&
      (o.category === "work" || o.category === "studies") &&
      o.shiftType !== null,
  );

  // Label occurrences: punctual + recurring other events
  const labelOccurrences = occurrences.filter(
    (o) => o.type === "punctual" || o.category === "other",
  );

  return (
    <div
      className={[
        "flex min-h-[5rem] flex-col gap-0.5 overflow-hidden rounded-lg p-1 text-xs",
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

      {/* Text labels for punctual and other recurring events */}
      {labelOccurrences.map((occ) => (
        <span
          key={`${occ.eventId}-${occ.date}`}
          className="truncate rounded bg-stone-100 px-1 py-px text-[10px] leading-4 text-slate-700"
          title={occ.title}
        >
          {occ.title}
        </span>
      ))}
    </div>
  );
}
