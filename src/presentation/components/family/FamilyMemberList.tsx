import { Family } from "@/domain/entities/Family";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import {
  getPaletteTones,
  SHIFT_TONE_ORDER,
} from "@/presentation/utils/paletteUtils";
import { AssignDelegatedMemberPaletteForm } from "@/presentation/components/family/AssignDelegatedMemberPaletteForm";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { RemoveFamilyMemberButton } from "@/presentation/components/family/RemoveFamilyMemberButton";
import type { FamilyFormAction } from "@/presentation/components/family/types";

interface FamilyMemberListProps {
  family: Family;
  memberDirectory: Map<string, string>;
  isOwner?: boolean;
  removeMemberAction?: FamilyFormAction;
  assignPaletteAction?: FamilyFormAction;
  paletteOptions?: PaletteOption[];
}

const ROLE_LABELS = {
  delegated: "Delegado",
  member: "Miembro",
  owner: "Propietario",
} as const;

export function FamilyMemberList({
  family,
  memberDirectory,
  isOwner = false,
  removeMemberAction,
  assignPaletteAction,
  paletteOptions,
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
          const paletteName = member.colorPalette?.name as
            | ColorPaletteName
            | undefined;
          const tones = paletteName ? getPaletteTones(paletteName) : null;
          const canRemove =
            isOwner && removeMemberAction && member.role !== "owner";
          const canAssignPalette =
            isOwner &&
            assignPaletteAction &&
            paletteOptions &&
            member.role === "delegated";

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

                <div className="flex items-center gap-3">
                  {tones ? (
                    <div
                      className="flex h-6 w-24 overflow-hidden rounded-lg"
                      aria-label={`Paleta ${paletteName}`}
                      title={`Paleta ${paletteName}`}
                    >
                      {SHIFT_TONE_ORDER.map((tone) => (
                        <div
                          key={tone}
                          className="flex-1"
                          style={{ backgroundColor: tones[tone] }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      Sin paleta
                    </span>
                  )}

                  {canRemove ? (
                    <RemoveFamilyMemberButton
                      action={removeMemberAction}
                      familyId={family.id}
                      memberName={
                        memberDirectory.get(member.userId) ?? member.userId
                      }
                      memberUserId={member.userId}
                    />
                  ) : null}
                </div>
              </div>

              {canAssignPalette ? (
                <AssignDelegatedMemberPaletteForm
                  action={assignPaletteAction}
                  familyId={family.id}
                  targetUserId={member.userId}
                  memberName={
                    memberDirectory.get(member.userId) ?? member.userId
                  }
                  currentPalette={paletteName}
                  paletteOptions={paletteOptions}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
