"use client";

import { useState, useActionState } from "react";
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
}

interface EditRecurringWorkEventDefaults {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  frequencyUnit: string;
  frequencyInterval: number;
  shiftType?: string;
}

interface EditRecurringOtherEventDefaults {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  frequencyUnit: string;
  frequencyInterval: number;
  startTime?: string;
  endTime?: string;
}

type EditEventDefaults =
  | EditPunctualEventDefaults
  | EditRecurringWorkEventDefaults
  | EditRecurringOtherEventDefaults;

interface EditEventFormProps {
  action: EventFormAction;
  eventId: string;
  eventType: "punctual" | "recurring-work" | "recurring-other";
  defaults: EditEventDefaults;
  redirectTo: string;
}

export function EditEventForm({
  action,
  eventId,
  eventType,
  defaults,
  redirectTo,
}: EditEventFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, EMPTY_EVENT_FORM_STATE);
  const [scope, setScope] = useState<"all" | "single">("all");

  const isRecurring =
    eventType === "recurring-work" || eventType === "recurring-other";

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">
        Editar evento
      </h2>

      <form
        action={formAction}
        className="space-y-4"
        aria-label="Editar evento"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="eventType" value={eventType} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="scope" value={scope} />

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
              className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
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
                defaultValue={(defaults as EditPunctualEventDefaults).date}
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
              {state.errors?.date && (
                <p className="text-xs text-red-500">{state.errors.date}</p>
              )}
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
                defaultValue={
                  (defaults as EditPunctualEventDefaults).startTime ?? ""
                }
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
                defaultValue={
                  (defaults as EditPunctualEventDefaults).endTime ?? ""
                }
                className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {(eventType === "recurring-work" || eventType === "recurring-other") &&
          scope === "all" && (
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
                  defaultValue={
                    (defaults as EditRecurringWorkEventDefaults).startDate
                  }
                  className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                />
                {state.errors?.startDate && (
                  <p className="text-xs text-red-500">
                    {state.errors.startDate}
                  </p>
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
                  defaultValue={
                    (defaults as EditRecurringWorkEventDefaults).endDate ?? ""
                  }
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
                  defaultValue={
                    (defaults as EditRecurringWorkEventDefaults).frequencyUnit
                  }
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
                  defaultValue={
                    (defaults as EditRecurringWorkEventDefaults)
                      .frequencyInterval
                  }
                  className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                />
              </div>

              {eventType === "recurring-work" && (
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
                    defaultValue={
                      (defaults as EditRecurringWorkEventDefaults).shiftType ??
                      ""
                    }
                    className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  >
                    <option value="morning">Mañana</option>
                    <option value="day">Día</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noche</option>
                  </select>
                </div>
              )}

              {eventType === "recurring-other" && (
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
                      defaultValue={
                        (defaults as EditRecurringOtherEventDefaults)
                          .startTime ?? ""
                      }
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
                      defaultValue={
                        (defaults as EditRecurringOtherEventDefaults).endTime ??
                        ""
                      }
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
    </section>
  );
}
