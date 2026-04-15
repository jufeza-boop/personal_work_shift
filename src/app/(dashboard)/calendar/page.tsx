import Link from "next/link";
import { createEventAction, deleteEventAction } from "@/app/actions/events";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { serializeEvent } from "@/application/services/calendarUtils";
import type { SerializedMember } from "@/application/services/calendarUtils";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import { CalendarGrid } from "@/presentation/components/calendar/CalendarGrid";

export default async function CalendarPage() {
  const { activeFamily, memberDirectory, user } =
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
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Calendario familiar
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Crea tu primera familia desde{" "}
          <Link
            href="/settings"
            className="font-medium text-slate-900 underline"
          >
            Ajustes
          </Link>{" "}
          para empezar a compartir calendarios.
        </p>
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
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <CalendarGrid
        events={serializedEvents}
        members={serializedMembers}
        initialYear={initialYear}
        initialMonth={initialMonth}
        currentUserId={user.id}
        familyId={activeFamily.id}
        createAction={createEventAction}
        deleteAction={deleteEventAction}
      />
    </section>
  );
}
