"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";
import { DayCreateEventForm } from "@/presentation/components/calendar/DayCreateEventForm";
import { Spinner } from "@/presentation/components/ui/Spinner";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          Eliminando...
        </span>
      ) : (
        "Eliminar"
      )}
    </button>
  );
}

const MONTH_NAMES_FULL = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  work: "Trabajo",
  studies: "Estudios",
  other: "Otro",
};

const SHIFT_TYPE_LABELS: Record<string, string> = {
  morning: "Mañana",
  day: "Día",
  afternoon: "Tarde",
  night: "Noche",
};

interface DayDetailPanelProps {
  date: string;
  day: number;
  month: number;
  year: number;
  occurrences: CalendarOccurrence[];
  members: SerializedMember[];
  currentUserId: string;
  delegatedUsers?: { id: string; displayName: string }[];
  familyId: string;
  createAction: EventFormAction;
  deleteAction: EventFormAction;
  onClose: () => void;
}

interface DeleteDialogState {
  eventId: string;
  eventType: "punctual" | "recurring";
  scope: "all" | "single";
}

export function DayDetailPanel({
  date,
  day,
  month,
  year,
  occurrences,
  members,
  currentUserId,
  delegatedUsers = [],
  familyId,
  createAction,
  deleteAction,
  onClose,
}: DayDetailPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(
    null,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    EMPTY_EVENT_FORM_STATE,
  );

  const memberMap = new Map(members.map((m) => [m.userId, m]));
  const delegatedUserIds = new Set(delegatedUsers.map((u) => u.id));
  const calendarRedirectTo = `/calendar?year=${year}&month=${month}`;

  return (
    <div
      data-testid="day-detail-panel"
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {day} de {MONTH_NAMES_FULL[month - 1]} {year}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-stone-100 hover:text-slate-900"
        >
          ✕
        </button>
      </div>

      {/* Event list for the day */}
      {occurrences.length === 0 && !showCreateForm && (
        <p className="mb-4 text-sm text-slate-500">
          No hay eventos para este día.
        </p>
      )}

      {occurrences.length > 0 && (
        <ul className="mb-4 divide-y divide-stone-100">
          {occurrences.map((occ) => {
            const member = memberMap.get(occ.createdBy);
            const isOwner =
              occ.createdBy === currentUserId ||
              delegatedUserIds.has(occ.createdBy);

            const isExpanded = expandedEventId === occ.eventId;

            return (
              <li key={`${occ.eventId}-${occ.date}`} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-800">
                      {occ.title}
                    </span>
                    {member && (
                      <span className="ml-2 text-xs text-slate-400">
                        {member.displayName}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={
                        isExpanded ? "Ocultar detalle" : "Ver detalle"
                      }
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedEventId(isExpanded ? null : occ.eventId)
                      }
                      className="text-slate-400 transition-transform hover:text-slate-700"
                    >
                      <span
                        className={[
                          "inline-block transition-transform duration-200",
                          isExpanded ? "rotate-90" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        ›
                      </span>
                    </button>
                    {isOwner && (
                      <>
                        <Link
                          href={`/calendar/events/${occ.eventId}/edit?date=${date}&redirectTo=${encodeURIComponent(calendarRedirectTo)}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteDialog({
                              eventId: occ.eventId,
                              eventType: occ.type,
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
                </div>

                {isExpanded && (
                  <div className="mt-2 space-y-1 rounded-lg bg-stone-50 px-3 py-2 text-xs text-slate-600">
                    <div>
                      <span className="font-medium text-slate-700">Tipo: </span>
                      {occ.type === "punctual" ? "Puntual" : "Recurrente"}
                    </div>
                    {occ.category && (
                      <div>
                        <span className="font-medium text-slate-700">
                          Categoría:{" "}
                        </span>
                        {CATEGORY_LABELS[occ.category] ?? occ.category}
                      </div>
                    )}
                    {occ.shiftType && (
                      <div>
                        <span className="font-medium text-slate-700">
                          Turno:{" "}
                        </span>
                        {SHIFT_TYPE_LABELS[occ.shiftType] ?? occ.shiftType}
                      </div>
                    )}
                    {occ.startTime && (
                      <div>
                        <span className="font-medium text-slate-700">
                          Hora inicio:{" "}
                        </span>
                        {occ.startTime}
                      </div>
                    )}
                    {occ.endTime && (
                      <div>
                        <span className="font-medium text-slate-700">
                          Hora fin:{" "}
                        </span>
                        {occ.endTime}
                      </div>
                    )}
                    {occ.description && (
                      <div>
                        <span className="font-medium text-slate-700">
                          Descripción:{" "}
                        </span>
                        {occ.description}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Create event section */}
      {showCreateForm ? (
        <DayCreateEventForm
          action={createAction}
          familyId={familyId}
          date={date}
          delegatedUsers={delegatedUsers}
          redirectTo={calendarRedirectTo}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="w-full rounded-xl border border-dashed border-stone-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-stone-50 hover:text-slate-800"
        >
          + Crear evento
        </button>
      )}

      {/* Delete confirmation dialog */}
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
              <input type="hidden" name="redirectTo" value={calendarRedirectTo} />

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
                      Solo este día
                    </label>
                  </div>
                </fieldset>
              )}

              {deleteDialog.eventType === "recurring" &&
                deleteDialog.scope === "single" && (
                  <input type="hidden" name="occurrenceDate" value={date} />
                )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteDialog(null)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <DeleteButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
