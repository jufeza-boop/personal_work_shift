import { Family } from "@/domain/entities/Family";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";

interface FamilyMemberListProps {
  family: Family;
  memberDirectory: Map<string, string>;
}

const ROLE_LABELS = {
  delegated: "Delegado",
  member: "Miembro",
  owner: "Propietario",
} as const;

// Tones ordered from lightest to darkest (morning → day → afternoon → night)
const PALETTE_TONES: Record<ColorPaletteName, readonly string[]> = {
  amber: ["#FEF3C7", "#FDE68A", "#FCD34D", "#D97706"],
  coral: ["#FFE5D9", "#FEC5BB", "#FCA5A5", "#EA580C"],
  emerald: ["#D1FAE5", "#A7F3D0", "#6EE7B7", "#059669"],
  rose: ["#FFE4E6", "#FECDD3", "#FDA4AF", "#E11D48"],
  sky: ["#E0F2FE", "#BAE6FD", "#7DD3FC", "#0284C7"],
  slate: ["#E2E8F0", "#CBD5E1", "#94A3B8", "#475569"],
  teal: ["#CCFBF1", "#99F6E4", "#5EEAD4", "#0F766E"],
  violet: ["#F3E8FF", "#DDD6FE", "#C4B5FD", "#7C3AED"],
};

export function FamilyMemberList({
  family,
  memberDirectory,
}: FamilyMemberListProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Miembros</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gestiona quién forma parte de {family.name}.
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-700">
          {family.members.length} personas
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {family.members.map((member) => {
          const paletteName = member.colorPalette?.name;
          const tones = paletteName ? PALETTE_TONES[paletteName] : null;

          return (
            <li
              className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-4"
              key={member.userId}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {memberDirectory.get(member.userId) ?? member.userId}
                  </p>
                  <p className="text-sm text-slate-600">
                    {ROLE_LABELS[member.role]}
                  </p>
                </div>

                {tones ? (
                  <div
                    className="flex h-6 w-24 overflow-hidden rounded-lg"
                    aria-label={`Paleta ${paletteName}`}
                    title={`Paleta ${paletteName}`}
                  >
                    {tones.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    Sin paleta
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
