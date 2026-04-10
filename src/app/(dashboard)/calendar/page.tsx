import Link from "next/link";
import { createFamilyAction, switchFamilyAction } from "@/app/actions/family";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";
import { FamilyMemberList } from "@/presentation/components/family/FamilyMemberList";
import { FamilySelectorPanel } from "@/presentation/components/family/FamilySelectorPanel";
import { Button } from "@/presentation/components/ui/button";

export default async function CalendarPage() {
  const { activeFamily, families, memberDirectory } =
    await getFamilyPageData("/calendar");

  if (!activeFamily) {
    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <CreateFamilyForm action={createFamilyAction} />

        <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Calendario familiar
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Crea tu primera familia para empezar a compartir calendarios con las
            personas que elijas.
          </p>
        </section>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <aside className="space-y-6">
        <FamilySelectorPanel
          action={switchFamilyAction}
          activeFamilyId={activeFamily.id}
          families={families}
        />
        <CreateFamilyForm
          action={createFamilyAction}
          key={`calendar-create-${families.length}-${activeFamily.id}`}
        />
      </aside>

      <div className="space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Calendario familiar
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Familia activa: <span className="font-medium">{activeFamily.name}</span>.
                La selección se conserva entre sesiones para que recuperes el
                contexto correcto al volver.
              </p>
            </div>

            <Button asChild variant="secondary">
              <Link href="/calendar/settings">Ajustes de familia</Link>
            </Button>
          </div>
        </section>

        <FamilyMemberList
          family={activeFamily}
          memberDirectory={memberDirectory}
        />

        <section className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">
            Próximo paso: eventos y vista mensual
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            La gestión de familias ya permite crear grupos, invitar miembros,
            cambiar de contexto y mantener la familia activa entre sesiones.
            En la siguiente fase este espacio cargará los turnos y eventos de{" "}
            {activeFamily.name}.
          </p>
        </section>
      </div>
    </section>
  );
}
