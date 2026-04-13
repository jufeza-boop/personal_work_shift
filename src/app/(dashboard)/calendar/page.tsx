import Link from "next/link";
import { createEventAction, deleteEventAction } from "@/app/actions/events";
import { createFamilyAction, switchFamilyAction } from "@/app/actions/family";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { serializeEvent } from "@/application/services/calendarUtils";
import type { SerializedMember } from "@/application/services/calendarUtils";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import { CalendarGrid } from "@/presentation/components/calendar/CalendarGrid";
import { CreateEventForm } from "@/presentation/components/events/CreateEventForm";
import { EventList } from "@/presentation/components/events/EventList";
import { CreateFamilyForm } from "@/presentation/components/family/CreateFamilyForm";
import { FamilyMemberList } from "@/presentation/components/family/FamilyMemberList";
import { FamilySelectorPanel } from "@/presentation/components/family/FamilySelectorPanel";
import { Button } from "@/presentation/components/ui/button";

export default async function CalendarPage() {
  const { activeFamily, families, memberDirectory, user } =
    await getFamilyPageData("/calendar");

  const events = activeFamily
    ? await createServerEventDependencies().then(({ eventRepository }) =>
        eventRepository.findByFamilyId(activeFamily.id),
      )
    : [];

  const serializedEvents = events.map(serializeEvent);

  const now = new Date();
  const initialYear = now.getUTCFullYear();
  const initialMonth = now.getUTCMonth() + 1;

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

  const serializedMembers: SerializedMember[] = activeFamily.members.map(
    (member) => ({
      userId: member.userId,
      displayName: memberDirectory.get(member.userId) ?? member.userId,
      colorPaletteName: member.colorPalette?.name ?? null,
    }),
  );

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
                Familia activa:{" "}
                <span className="font-medium">{activeFamily.name}</span>. La
                selección se conserva entre sesiones para que recuperes el
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

        {/* Monthly calendar view (US-3.1, US-3.2, US-3.3) */}
        <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
          <CalendarGrid
            events={serializedEvents}
            members={serializedMembers}
            initialYear={initialYear}
            initialMonth={initialMonth}
          />
        </section>

        <CreateEventForm
          action={createEventAction}
          familyId={activeFamily.id}
          redirectTo="/calendar"
        />

        <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Eventos</h3>
          <EventList
            events={events.map((e) => ({
              id: e.id,
              title: e.title,
              type: e.type,
              createdBy: e.createdBy,
            }))}
            currentUserId={user.id}
            deleteAction={deleteEventAction}
            redirectTo="/calendar"
          />
        </section>
      </div>
    </section>
  );
}
