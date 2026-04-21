import type { CSSProperties } from "react";
import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import {
  getBaseColor,
  getShiftColor,
} from "@/application/services/calendarUtils";

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

/**
 * Builds a CSS diagonal gradient string for two or more shift colors.
 * Each color occupies an equal portion of the cell divided by hard diagonal edges.
 * Returns null when fewer than two colors are provided.
 */
function buildShiftBackground(colors: string[]): string | null {
  if (colors.length < 2) return null;
  const n = colors.length;
  const parts: string[] = [];
  colors.forEach((color, i) => {
    const start = (i / n) * 100;
    const end = ((i + 1) / n) * 100;
    if (i === 0) {
      parts.push(`${color} ${end}%`);
    } else if (i === n - 1) {
      parts.push(`${color} ${start}%`);
    } else {
      parts.push(`${color} ${start}%`, `${color} ${end}%`);
    }
  });
  return `linear-gradient(135deg, ${parts.join(", ")})`;
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

  // Shift occurrences: recurring work/studies events — fill the entire day cell
  const shiftOccurrences = occurrences.filter(
    (o) =>
      o.type === "recurring" &&
      (o.category === "work" || o.category === "studies") &&
      o.shiftType !== null,
  );

  // Punctual events: shown as palette-colored text labels
  const punctualOccurrences = occurrences.filter((o) => o.type === "punctual");

  // Other recurring events: shown as colored text labels
  const otherOccurrences = occurrences.filter(
    (o) => o.type === "recurring" && o.category === "other",
  );

  // Resolve one hex color per shift occurrence
  const shiftColors = shiftOccurrences.map((occ) => {
    const member = memberMap.get(occ.createdBy);
    return (
      getShiftColor(member?.colorPaletteName ?? null, occ.shiftType) ??
      "#CBD5E1"
    );
  });

  const hasShiftBg = shiftColors.length > 0;
  const gradientBg = buildShiftBackground(shiftColors);

  // Inline style: gradient for 2+ shifts, flat color for 1 shift, empty otherwise
  const buttonBgStyle: CSSProperties =
    gradientBg !== null
      ? { background: gradientBg }
      : shiftColors.length === 1
        ? { backgroundColor: shiftColors[0]! }
        : {};

  return (
    <button
      type="button"
      onClick={() => onSelect(dateStr)}
      aria-label={`${day}`}
      className={[
        "flex min-h-[5rem] cursor-pointer flex-col gap-0.5 overflow-hidden rounded-lg p-1 text-left text-xs transition-colors",
        !hasShiftBg
          ? isToday
            ? "bg-blue-50"
            : "bg-white hover:bg-stone-50"
          : "",
        isToday ? "ring-1 ring-blue-300" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={buttonBgStyle}
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

      {/* Work/study shift events: background already shows the member color;
          display the event title so users know what the shift is */}
      {shiftOccurrences.map((occ) => (
        <span
          key={`${occ.eventId}-${occ.date}`}
          className="truncate rounded bg-white/40 px-1 py-px text-[10px] leading-4 text-slate-700"
          title={occ.title}
        >
          {occ.title}
        </span>
      ))}

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

      {/* Palette-colored text labels for punctual events */}
      {punctualOccurrences.map((occ) => {
        const member = memberMap.get(occ.createdBy);
        const bgColor =
          getBaseColor(member?.colorPaletteName ?? null) ?? "#E2E8F0";
        return (
          <span
            key={`${occ.eventId}-${occ.date}`}
            className="truncate rounded px-1 py-px text-[10px] leading-4 text-slate-700"
            style={{ backgroundColor: bgColor }}
            title={occ.title}
          >
            {occ.title}
          </span>
        );
      })}
    </button>
  );
}
