"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";
import {
  DeleteEventDialog,
  type DeleteDialogState,
} from "@/presentation/components/events/DeleteEventDialog";

interface EventSummary {
  id: string;
  title: string;
  type: "punctual" | "recurring";
  createdBy: string;
}

interface EventListProps {
  events: EventSummary[];
  currentUserId: string;
  deleteAction: EventFormAction;
  redirectTo: string;
}

export function EventList({
  events,
  currentUserId,
  deleteAction,
  redirectTo,
}: EventListProps) {
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(
    null,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    EMPTY_EVENT_FORM_STATE,
  );

  if (events.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Aún no hay eventos para esta familia.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 divide-y divide-stone-100">
        {events.map((event) => (
          <li className="flex items-center justify-between py-3" key={event.id}>
            <span className="text-sm font-medium text-slate-800">
              {event.title}
            </span>
            <div className="ml-4 flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs text-slate-500">
                {event.type === "punctual" ? "Puntual" : "Recurrente"}
              </span>
              {event.createdBy === currentUserId && (
                <>
                  <Link
                    href={`/calendar/events/${event.id}/edit`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteDialog({
                        eventId: event.id,
                        eventType: event.type,
                        scope: "all",
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {deleteDialog && (
        <DeleteEventDialog
          dialog={deleteDialog}
          redirectTo={redirectTo}
          deleteFormAction={deleteFormAction}
          deleteState={deleteState}
          onClose={() => setDeleteDialog(null)}
          onScopeChange={(scope) =>
            setDeleteDialog((d) => (d ? { ...d, scope } : null))
          }
        />
      )}
    </>
  );
}
