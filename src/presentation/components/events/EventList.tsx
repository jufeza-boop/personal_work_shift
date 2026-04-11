"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";

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

interface DeleteDialogState {
  eventId: string;
  eventType: "punctual" | "recurring";
  scope: "all" | "single";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Eliminar evento
            </h3>

            {deleteState.message && (
              <p className="text-sm text-red-500">{deleteState.message}</p>
            )}

            <form
              action={deleteFormAction}
              className="space-y-4"
              aria-label="Eliminar evento"
            >
              <input
                type="hidden"
                name="eventId"
                value={deleteDialog.eventId}
              />
              <input type="hidden" name="scope" value={deleteDialog.scope} />
              <input type="hidden" name="redirectTo" value={redirectTo} />

              {deleteDialog.eventType === "recurring" && (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-700">
                    ¿Qué quieres eliminar?
                  </legend>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="deleteScopeRadio"
                        value="all"
                        checked={deleteDialog.scope === "all"}
                        onChange={() =>
                          setDeleteDialog((d) =>
                            d ? { ...d, scope: "all" } : null,
                          )
                        }
                      />
                      Toda la serie
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="deleteScopeRadio"
                        value="single"
                        checked={deleteDialog.scope === "single"}
                        onChange={() =>
                          setDeleteDialog((d) =>
                            d ? { ...d, scope: "single" } : null,
                          )
                        }
                      />
                      Una ocurrencia
                    </label>
                  </div>
                </fieldset>
              )}

              {deleteDialog.eventType === "recurring" &&
                deleteDialog.scope === "single" && (
                  <div className="space-y-1">
                    <label
                      htmlFor="deleteOccurrenceDate"
                      className="text-sm font-medium text-slate-700"
                    >
                      Fecha de la ocurrencia
                    </label>
                    <input
                      id="deleteOccurrenceDate"
                      name="occurrenceDate"
                      type="date"
                      required
                      className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteDialog(null)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
