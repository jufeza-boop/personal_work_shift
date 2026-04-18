import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { Family } from "@/domain/entities/Family";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import {
  addDelegatedUserToFamilyAction,
  addFamilyMemberAction,
  assignDelegatedMemberPaletteAction,
  deleteFamilyAction,
  leaveFamilyAction,
  removeFamilyMemberAction,
  renameFamilyAction,
  selectPaletteAction,
} from "@/app/actions/family";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { AddDelegatedUserToFamilyForm } from "@/presentation/components/family/AddDelegatedUserToFamilyForm";
import { DeleteFamilyForm } from "@/presentation/components/family/DeleteFamilyForm";
import { FamilyMemberList } from "@/presentation/components/family/FamilyMemberList";
import { InviteFamilyMemberForm } from "@/presentation/components/family/InviteFamilyMemberForm";
import { LeaveFamilyForm } from "@/presentation/components/family/LeaveFamilyForm";
import { RenameFamilyForm } from "@/presentation/components/family/RenameFamilyForm";
import { SelectPaletteForm } from "@/presentation/components/family/SelectPaletteForm";

/**
 * Returns all palette options with availability flags, treating the given
 * userId's current palette as still available so they can re-select it.
 * Pass `forUserId = null` to treat all assigned palettes as disabled.
 */
function buildPaletteOptions(
  family: Family,
  forUserId: string | null,
): PaletteOption[] {
  return ColorPalette.availablePalettes().map((paletteName) => {
    const takenByOther = family.members.some(
      (m) =>
        m.userId !== forUserId &&
        m.colorPalette !== null &&
        m.colorPalette.name === paletteName,
    );

    return { disabled: takenByOther, name: paletteName };
  });
}

export default async function FamilySettingsPage() {
  const { activeFamily, delegatedUsers, memberDirectory, user } =
    await getFamilyPageData("/calendar/settings");

  if (!activeFamily) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Ajustes de familia
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Crea una familia para habilitar invitaciones, cambio de contexto y
          personalización del grupo.
        </p>
      </section>
    );
  }

  const isOwner = activeFamily.createdBy === user.id;
  // For the invite form any taken palette is disabled (no user context)
  const paletteOptions = buildPaletteOptions(activeFamily, null);
  // For the current user's picker their own palette remains selectable
  const paletteOptionsForMe = buildPaletteOptions(activeFamily, user.id);
  const myPaletteName = activeFamily.members.find((m) => m.userId === user.id)
    ?.colorPalette?.name;

  // Delegated users not yet in this family
  const activeFamilyMemberIds = new Set(
    activeFamily.members.map((m) => m.userId),
  );
  const availableDelegatedUsers = delegatedUsers
    .filter((du) => !activeFamilyMemberIds.has(du.id))
    .map((du) => ({ displayName: du.displayName, id: du.id }));

  return (
    <section className="space-y-6">
      {isOwner ? (
        <>
          <RenameFamilyForm
            action={renameFamilyAction}
            familyId={activeFamily.id}
            initialName={activeFamily.name}
          />
          <InviteFamilyMemberForm
            action={addFamilyMemberAction}
            familyId={activeFamily.id}
            paletteOptions={paletteOptions}
          />
          <AddDelegatedUserToFamilyForm
            action={addDelegatedUserToFamilyAction}
            availableDelegatedUsers={availableDelegatedUsers}
            familyId={activeFamily.id}
            paletteOptions={paletteOptions}
          />
        </>
      ) : (
        <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Ajustes de familia
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Solo el propietario puede renombrar la familia o añadir miembros.
            Aun así, puedes revisar la composición actual del grupo.
          </p>
        </section>
      )}

      <SelectPaletteForm
        action={selectPaletteAction}
        familyId={activeFamily.id}
        paletteOptions={paletteOptionsForMe}
        currentPalette={myPaletteName}
      />

      <FamilyMemberList
        family={activeFamily}
        memberDirectory={memberDirectory}
        isOwner={isOwner}
        removeMemberAction={isOwner ? removeFamilyMemberAction : undefined}
        assignPaletteAction={
          isOwner ? assignDelegatedMemberPaletteAction : undefined
        }
        paletteOptions={isOwner ? paletteOptions : undefined}
      />

      {isOwner ? (
        <DeleteFamilyForm
          action={deleteFamilyAction}
          familyId={activeFamily.id}
          familyName={activeFamily.name}
        />
      ) : (
        <LeaveFamilyForm
          action={leaveFamilyAction}
          familyId={activeFamily.id}
          familyName={activeFamily.name}
        />
      )}
    </section>
  );
}
