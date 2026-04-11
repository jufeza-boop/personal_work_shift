import { Family } from "@/domain/entities/Family";

interface FamilyMemberListProps {
  family: Family;
  memberDirectory: Map<string, string>;
}

const ROLE_LABELS = {
  delegated: "Delegado",
  member: "Miembro",
  owner: "Propietario",
} as const;

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
        {family.members.map((member) => (
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

              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {member.colorPalette
                  ? `Paleta ${member.colorPalette.name}`
                  : "Sin paleta"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
