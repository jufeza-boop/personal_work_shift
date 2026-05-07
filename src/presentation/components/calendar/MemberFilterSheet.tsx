"use client";

import type { SerializedMember } from "@/application/services/calendarUtils";

interface MemberFilterSheetProps {
  isOpen: boolean;
  members: SerializedMember[];
  hiddenMemberIds: Set<string>;
  onToggle: (userId: string) => void;
  onClose: () => void;
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

export function MemberFilterSheet({
  isOpen,
  members,
  hiddenMemberIds,
  onToggle,
  onClose,
}: MemberFilterSheetProps) {
  const visibleCount = members.filter(
    (m) => !hiddenMemberIds.has(m.userId),
  ).length;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="member-sheet-backdrop"
        aria-hidden="true"
        onClick={isOpen ? onClose : undefined}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Bottom sheet panel */}
      <div
        role="dialog"
        aria-label="Filtrar miembros"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        {/* Title */}
        <div className="px-5 pt-1 pb-2">
          <h2 className="text-base font-semibold text-slate-800">
            Filtrar miembros
          </h2>
        </div>

        {/* Member list */}
        <ul className="flex-1 overflow-y-auto px-3 pb-2">
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
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                    isLastVisible
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-stone-50",
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
                    className="h-4 w-4 rounded accent-slate-600"
                  />
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-sm"
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

        {/* Apply button */}
        <div className="px-5 pt-2 pb-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
}
