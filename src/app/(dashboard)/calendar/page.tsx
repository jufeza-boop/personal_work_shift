import Link from "next/link";
import { createEventAction, deleteEventAction } from "@/app/actions/events";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import {
  serializeEvent,
  serializeException,
} from "@/application/services/calendarUtils";
import type { SerializedMember } from "@/application/services/calendarUtils";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import { CalendarGrid } from "@/presentation/components/calendar/CalendarGrid";
import { NotificationOptIn } from "@/presentation/components/ui/NotificationOptIn";

export default async function CalendarPage() {
  const { activeFamily, delegatedUsers, memberDirectory, user } =
    await getFamilyPageData("/calendar");

  const { eventRepository } = await createServerEventDependencies();

  const events = activeFamily
    ? await eventRepository.findByFamilyId(activeFamily.id)
    : [];

  const exceptions =
    events.length > 0
      ? await eventRepository.findExceptionsByEventIds(events.map((e) => e.id))
      : [];

  const serializedEvents = events.map(serializeEvent);
  const serializedExceptions = exceptions.map(serializeException);

  const now = new Date();
  const initialYear = now.getUTCFullYear();
  const initialMonth = now.getUTCMonth() + 1;

  if (!activeFamily) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
      </div>
    );
  }

  const serializedMembers: SerializedMember[] = activeFamily.members.map(
    (member) => ({
      userId: member.userId,
      displayName: memberDirectory.get(member.userId) ?? member.userId,
      colorPaletteName: member.colorPalette?.name ?? null,
    }),
  );

  const serializedDelegatedUsers = delegatedUsers.map((u) => ({
    displayName: u.displayName,
    id: u.id,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-2 pt-2 pb-0 sm:px-3">
        <NotificationOptIn />
      </div>
      <CalendarGrid
        initialEvents={serializedEvents}
        initialExceptions={serializedExceptions}
        members={serializedMembers}
        initialYear={initialYear}
        initialMonth={initialMonth}
        currentUserId={user.id}
        delegatedUsers={serializedDelegatedUsers}
        familyId={activeFamily.id}
        createAction={createEventAction}
        deleteAction={deleteEventAction}
      />
    </div>
  );
}
