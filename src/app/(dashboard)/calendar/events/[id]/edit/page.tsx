import { redirect } from "next/navigation";
import { editEventAction } from "@/app/actions/events";
import { getFamilyPageData } from "@/app/(dashboard)/familyPageData";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { EditEventForm } from "@/presentation/components/events/EditEventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ date?: string }>;
}

export default async function EditEventPage({
  params,
  searchParams,
}: EditEventPageProps) {
  const { id } = await params;
  const occurrenceDate = searchParams ? (await searchParams).date : undefined;
  const { user, delegatedUsers } = await getFamilyPageData("/calendar");
  const { eventRepository } = await createServerEventDependencies();
  const event = await eventRepository.findById(id);

  if (!event) {
    redirect("/calendar");
  }

  const isOwnEvent = event.createdBy === user.id;
  const isDelegatedEvent = delegatedUsers.some((u) => u.id === event.createdBy);
  if (!isOwnEvent && !isDelegatedEvent) {
    redirect("/calendar");
  }

  const exceptions = await eventRepository.findExceptionsByEventIds([id]);
  const hasExceptions = exceptions.length > 0;

  if (event instanceof PunctualEvent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <EditEventForm
          action={editEventAction}
          eventId={event.id}
          eventType="punctual"
          defaults={{
            title: event.title,
            description: event.description ?? undefined,
            date: event.date.toISOString().slice(0, 10),
            startTime: event.startTime ?? undefined,
            endTime: event.endTime ?? undefined,
          }}
          redirectTo="/calendar"
        />
      </div>
    );
  }

  const recurring = event as RecurringEvent;
  const eventSubType: "recurring-work" | "recurring-other" =
    recurring.category === "work" || recurring.category === "studies"
      ? "recurring-work"
      : "recurring-other";

  if (eventSubType === "recurring-work") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <EditEventForm
          action={editEventAction}
          eventId={event.id}
          eventType="recurring-work"
          defaults={{
            title: event.title,
            description: event.description ?? undefined,
            startDate: recurring.startDate.toISOString().slice(0, 10),
            endDate: recurring.endDate?.toISOString().slice(0, 10) ?? undefined,
            frequencyUnit: recurring.frequency.unit,
            frequencyInterval: recurring.frequency.interval,
            shiftType: recurring.shiftType?.value ?? undefined,
          }}
          redirectTo="/calendar"
          occurrenceDate={occurrenceDate}
          hasExceptions={hasExceptions}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <EditEventForm
        action={editEventAction}
        eventId={event.id}
        eventType="recurring-other"
        defaults={{
          title: event.title,
          description: event.description ?? undefined,
          startDate: recurring.startDate.toISOString().slice(0, 10),
          endDate: recurring.endDate?.toISOString().slice(0, 10) ?? undefined,
          frequencyUnit: recurring.frequency.unit,
          frequencyInterval: recurring.frequency.interval,
          startTime: recurring.startTime ?? undefined,
          endTime: recurring.endTime ?? undefined,
        }}
        redirectTo="/calendar"
        occurrenceDate={occurrenceDate}
        hasExceptions={hasExceptions}
      />
    </div>
  );
}
