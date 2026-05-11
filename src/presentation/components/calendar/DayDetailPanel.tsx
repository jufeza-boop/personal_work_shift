"use client";

import { useState, useActionState } from "react";
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
import {
  DeleteEventDialog,
  type DeleteDialogState,
} from "@/presentation/components/events/DeleteEventDialog";
import { MONTH_NAMES_FULL } from "@/presentation/utils/dateLocale";

const CATEGORY_LABELS: Record<string, string> = {
  work: "Trabajo",
  studies: "Estudios",
  vacations: "Vacaciones",
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
        <DeleteEventDialog
          dialog={deleteDialog}
          redirectTo={calendarRedirectTo}
          deleteFormAction={deleteFormAction}
          deleteState={deleteState}
          onClose={() => setDeleteDialog(null)}
          onScopeChange={(scope) =>
            setDeleteDialog((d) => (d ? { ...d, scope } : null))
          }
          occurrenceDate={date}
        />
      )}
    </div>
  );
}
