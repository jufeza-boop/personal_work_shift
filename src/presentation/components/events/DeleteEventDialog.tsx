"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/presentation/components/ui/Spinner";
import type { EventFormState } from "@/presentation/components/events/types";

export interface DeleteDialogState {
  eventId: string;
  eventType: "punctual" | "recurring";
  scope: "all" | "single";
}

interface DeleteEventDialogProps {
  dialog: DeleteDialogState;
  redirectTo: string;
  deleteFormAction: (formData: FormData) => void;
  deleteState: EventFormState;
  onClose: () => void;
  onScopeChange: (scope: "all" | "single") => void;
  /**
   * When provided the occurrence date is pre-filled as a hidden input.
   * When absent a visible date picker is rendered so the user can choose the date.
   */
  occurrenceDate?: string;
}

function DeleteSubmitButton() {
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

export function DeleteEventDialog({
  dialog,
  redirectTo,
  deleteFormAction,
  deleteState,
  onClose,
  onScopeChange,
  occurrenceDate,
}: DeleteEventDialogProps) {
  return (
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
          <input type="hidden" name="eventId" value={dialog.eventId} />
          <input type="hidden" name="scope" value={dialog.scope} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {dialog.eventType === "recurring" && (
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
                    checked={dialog.scope === "all"}
                    onChange={() => onScopeChange("all")}
                  />
                  Toda la serie
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="deleteScopeRadio"
                    value="single"
                    checked={dialog.scope === "single"}
                    onChange={() => onScopeChange("single")}
                  />
                  {occurrenceDate !== undefined
                    ? "Solo este día"
                    : "Una ocurrencia"}
                </label>
              </div>
            </fieldset>
          )}

          {dialog.eventType === "recurring" && dialog.scope === "single" && (
            occurrenceDate !== undefined ? (
              <input
                type="hidden"
                name="occurrenceDate"
                value={occurrenceDate}
              />
            ) : (
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
            )
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-700 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <DeleteSubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
