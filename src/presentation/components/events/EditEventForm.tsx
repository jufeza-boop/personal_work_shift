"use client";

import { useState, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";

interface EditPunctualEventDefaults {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  shiftType?: string;
}

interface EditRecurringEventDefaults {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  frequencyUnit: string;
  frequencyInterval: number;
  category?: string;
  shiftType?: string;
  startTime?: string;
  endTime?: string;
}

/** @deprecated Use EditRecurringEventDefaults */
type EditRecurringWorkEventDefaults = EditRecurringEventDefaults;
/** @deprecated Use EditRecurringEventDefaults */
type EditRecurringOtherEventDefaults = EditRecurringEventDefaults;

type EditEventDefaults = EditPunctualEventDefaults | EditRecurringEventDefaults;

interface EditEventFormProps {
  action: EventFormAction;
  eventId: string;
  eventType: "punctual" | "recurring";
  defaults: EditEventDefaults;
  redirectTo: string;
  occurrenceDate?: string;
  hasExceptions?: boolean;
}

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "Sin categoría", value: "" },
  { label: "Trabajo", value: "work" },
  { label: "Estudios", value: "studies" },
  { label: "Vacaciones", value: "vacations" },
  { label: "Otro", value: "other" },
];

const CATEGORY_OPTIONS_REQUIRED = CATEGORY_OPTIONS.filter(
  (opt) => opt.value !== "",
);

export function EditEventForm({
  action,
  eventId,
  eventType,
  defaults,
  redirectTo,
  occurrenceDate,
  hasExceptions,
}: EditEventFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, EMPTY_EVENT_FORM_STATE);
  const [scope, setScope] = useState<"all" | "single">("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

  const isRecurring = eventType === "recurring";

  const recurringDefaults = isRecurring
    ? (defaults as EditRecurringEventDefaults)
    : null;

  const punctualDefaults = isRecurring
    ? null
    : (defaults as EditPunctualEventDefaults);

  const [startDate, setStartDate] = useState(
    recurringDefaults?.startDate ?? "",
  );
  const [frequencyUnit, setFrequencyUnit] = useState(
    recurringDefaults?.frequencyUnit ?? "daily",
  );
  const [frequencyInterval, setFrequencyInterval] = useState(
    recurringDefaults?.frequencyInterval ?? 1,
  );

  const initialCategory = isRecurring
    ? (recurringDefaults?.category ?? "")
    : (punctualDefaults?.category ?? "");

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const needsShiftType =
    selectedCategory === "work" || selectedCategory === "studies";
  const hasTimeFields =
    selectedCategory === "" ||
    selectedCategory === "vacations" ||
    selectedCategory === "other";

  const willLoseExceptions =
    hasExceptions === true &&
    scope === "all" &&
    (startDate !== (recurringDefaults?.startDate ?? "") ||
      frequencyUnit !== (recurringDefaults?.frequencyUnit ?? "daily") ||
      Number(frequencyInterval) !==
        (recurringDefaults?.frequencyInterval ?? 1));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (willLoseExceptions && !confirmedRef.current) {
      e.preventDefault();
      setShowConfirmDialog(true);
    }
  }

  function handleConfirm() {
    confirmedRef.current = true;
    setShowConfirmDialog(false);
    formRef.current?.requestSubmit();
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">
        Editar evento
      </h2>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Editar evento"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="eventType" value={eventType} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="scope" value={scope} />
        {willLoseExceptions && (
          <input type="hidden" name="deleteExceptions" value="true" />
        )}

        {isRecurring && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              ¿Qué quieres editar?
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="scopeRadio"
                  value="all"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                Toda la serie
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="scopeRadio"
                  value="single"
                  checked={scope === "single"}
                  onChange={() => setScope("single")}
                />
                Esta ocurrencia
              </label>
            </div>
          </fieldset>
        )}

        {isRecurring && scope === "single" && (
          <div className="space-y-1">
            <label
              htmlFor="occurrenceDate"
              className="text-sm font-medium text-slate-700"
            >
              Fecha de la ocurrencia
            </label>
            <input
              id="occurrenceDate"
              name="occurrenceDate"
              type="date"
              required
              defaultValue={occurrenceDate}
              disabled
              className="block w-full cursor-not-allowed rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm text-slate-500"
            />
            {occurrenceDate && (
              <input
                type="hidden"
                name="occurrenceDate"
                value={occurrenceDate}
              />
            )}
            <p className="text-xs text-slate-500">
              Esta fecha no se puede cambiar para evitar modificar otra
              ocurrencia.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={defaults.title}
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
          />
          {state.errors?.title && (
            <p className="text-xs text-red-500">{state.errors.title}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-700"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={defaults.description ?? ""}
            className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {eventType === "punctual" && (
          <>
            <div className="space-y-1">
              <label
                htmlFor="date"
                className="text-sm font-medium text-slate-700"
              >
                Fecha
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={punctualDefaults?.date ?? ""}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
              {state.errors?.date && (
                <p className="text-xs text-red-500">{state.errors.date}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-slate-700"
              >
                Categoría (opcional)
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {state.errors?.category && (
                <p className="text-xs text-red-500">{state.errors.category}</p>
              )}
            </div>

            {needsShiftType && (
              <div className="space-y-1">
                <label
                  htmlFor="shiftType"
                  className="text-sm font-medium text-slate-700"
                >
                  Tipo de turno
                </label>
                <select
                  id="shiftType"
                  name="shiftType"
                  defaultValue={punctualDefaults?.shiftType ?? ""}
                  className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="morning">Mañana</option>
                  <option value="day">Día</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noche</option>
                </select>
                {state.errors?.shiftType && (
                  <p className="text-xs text-red-500">
                    {state.errors.shiftType}
                  </p>
                )}
              </div>
            )}

            {hasTimeFields && (
              <>
                <div className="space-y-1">
                  <label
                    htmlFor="startTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hora de inicio (opcional)
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={punctualDefaults?.startTime ?? ""}
                    className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="endTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hora de fin (opcional)
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={punctualDefaults?.endTime ?? ""}
                    className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </>
        )}

        {isRecurring && scope === "all" && (
          <>
            <div className="space-y-1">
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-slate-700"
              >
                Fecha de inicio
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
              {state.errors?.startDate && (
                <p className="text-xs text-red-500">{state.errors.startDate}</p>
              )}
            </div>
            <div className="space-y-1">
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-slate-700"
              >
                Fecha de fin (opcional)
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={recurringDefaults?.endDate ?? ""}
                min={startDate || undefined}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="frequencyUnit"
                className="text-sm font-medium text-slate-700"
              >
                Frecuencia
              </label>
              <select
                id="frequencyUnit"
                name="frequencyUnit"
                value={frequencyUnit}
                onChange={(e) => setFrequencyUnit(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="annual">Anual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="frequencyInterval"
                className="text-sm font-medium text-slate-700"
              >
                Intervalo
              </label>
              <input
                id="frequencyInterval"
                name="frequencyInterval"
                type="number"
                min={1}
                max={365}
                value={frequencyInterval}
                onChange={(e) => setFrequencyInterval(Number(e.target.value))}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-slate-700"
              >
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS_REQUIRED.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {needsShiftType && (
              <div className="space-y-1">
                <label
                  htmlFor="shiftType"
                  className="text-sm font-medium text-slate-700"
                >
                  Tipo de turno
                </label>
                <select
                  id="shiftType"
                  name="shiftType"
                  defaultValue={recurringDefaults?.shiftType ?? ""}
                  className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="morning">Mañana</option>
                  <option value="day">Día</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noche</option>
                </select>
              </div>
            )}

            {hasTimeFields && (
              <>
                <div className="space-y-1">
                  <label
                    htmlFor="startTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hora de inicio (opcional)
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={recurringDefaults?.startTime ?? ""}
                    className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="endTime"
                    className="text-sm font-medium text-slate-700"
                  >
                    Hora de fin (opcional)
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={recurringDefaults?.endTime ?? ""}
                    className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </>
        )}

        {isRecurring && scope === "single" && (
          <>
            <div className="space-y-1">
              <label
                htmlFor="newDate"
                className="text-sm font-medium text-slate-700"
              >
                Nueva fecha (opcional)
              </label>
              <input
                id="newDate"
                name="newDate"
                type="date"
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="startTime"
                className="text-sm font-medium text-slate-700"
              >
                Hora de inicio (opcional)
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="endTime"
                className="text-sm font-medium text-slate-700"
              >
                Hora de fin (opcional)
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {willLoseExceptions && (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-amber-500">
              ⚠️
            </span>
            <span>
              Al cambiar la fecha de inicio o la frecuencia se eliminarán todos
              los cambios puntuales realizados en ocurrencias individuales de
              esta serie.
            </span>
          </div>
        )}

        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
        </div>
      </form>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <dialog
            open
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3
              id="confirm-dialog-title"
              className="mb-3 text-base font-semibold text-slate-900"
            >
              ¿Eliminar cambios puntuales?
            </h3>
            <p className="mb-5 text-sm text-slate-600">
              Al cambiar la fecha de inicio o la frecuencia se eliminarán de
              forma permanente todos los cambios puntuales realizados en
              ocurrencias individuales de esta serie. Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Sí, eliminar y guardar
              </button>
            </div>
          </dialog>
        </div>
      )}
    </section>
  );
}

export type {
  EditPunctualEventDefaults,
  EditRecurringEventDefaults,
  EditRecurringWorkEventDefaults,
  EditRecurringOtherEventDefaults,
};
