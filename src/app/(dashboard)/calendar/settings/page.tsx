import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import {
  addFamilyMemberAction,
  createFamilyAction,
  renameFamilyAction,
  switchFamilyAction,
} from "@/app/actions/family";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";
import { FamilyMemberList } from "@/presentation/components/family/FamilyMemberList";
import { FamilySelectorPanel } from "@/presentation/components/family/FamilySelectorPanel";
import { InviteFamilyMemberForm } from "@/presentation/components/family/InviteFamilyMemberForm";
import { RenameFamilyForm } from "@/presentation/components/family/RenameFamilyForm";

export default async function FamilySettingsPage() {
  const { activeFamily, families, memberDirectory, user } =
    await getFamilyPageData("/calendar/settings");

  if (!activeFamily) {
    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <CreateFamilyForm
          action={createFamilyAction}
          key="settings-create-empty"
          redirectTo="/calendar/settings"
        />

        <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Ajustes de familia
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Crea una familia para habilitar invitaciones, cambio de contexto y
            personalización del grupo.
          </p>
        </section>
      </section>
    );
  }

  const isOwner = activeFamily.createdBy === user.id;
  const paletteOptions = ColorPalette.availablePalettes().map((paletteName) => ({
    disabled: !activeFamily.isColorPaletteAvailable(
      ColorPalette.create(paletteName),
    ),
    name: paletteName,
  }));

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <aside className="space-y-6">
        <FamilySelectorPanel
          action={switchFamilyAction}
          activeFamilyId={activeFamily.id}
          families={families}
          redirectTo="/calendar/settings"
        />
        <CreateFamilyForm
          action={createFamilyAction}
          key={`settings-create-${families.length}-${activeFamily.id}`}
          redirectTo="/calendar/settings"
        />
      </aside>

      <div className="space-y-6">
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

        <FamilyMemberList
          family={activeFamily}
          memberDirectory={memberDirectory}
        />
      </div>
    </section>
  );
}
