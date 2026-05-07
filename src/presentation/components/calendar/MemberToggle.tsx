"use client";

import { useState } from "react";
import type { SerializedMember } from "@/application/services/calendarUtils";

interface MemberToggleProps {
  members: SerializedMember[];
  hiddenMemberIds: Set<string>;
  onToggle: (userId: string) => void;
}

const PALETTE_SAMPLE_COLORS: Record<string, string> = {
  amber: "#FDE68A",
  coral: "#FEC5BB",
  emerald: "#A7F3D0",
  rose: "#FECDD3",
  sky: "#BAE6FD",
  slate: "#CBD5E1",
  teal: "#99F6E4",
  violet: "#DDD6FE",
};

export function MemberToggle({
  members,
  hiddenMemberIds,
  onToggle,
}: MemberToggleProps) {
  const [isOpen, setIsOpen] = useState(true);

  const visibleCount = members.filter(
    (m) => !hiddenMemberIds.has(m.userId),
  ).length;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-1 rounded px-1 py-0.5 hover:bg-stone-100 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Miembros
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <ul className="space-y-1">
          {members.map((member) => {
            const isVisible = !hiddenMemberIds.has(member.userId);
            const isLastVisible = isVisible && visibleCount === 1;
            const sampleColor = member.colorPaletteName
              ? (PALETTE_SAMPLE_COLORS[member.colorPaletteName] ?? "#CBD5E1")
              : "#CBD5E1";

            return (
              <li key={member.userId}>
                <label
                  className={[
                    "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors",
                    isLastVisible
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-stone-100",
                  ].join(" ")}
                  title={
                    isLastVisible
                      ? "Al menos un miembro debe estar visible"
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    disabled={isLastVisible}
                    onChange={() => onToggle(member.userId)}
                    className="h-3.5 w-3.5 rounded accent-slate-600"
                  />
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: sampleColor }}
                  />
                  <span className="truncate text-slate-700">
                    {member.displayName}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
