"use client";

import { useActionState, useId, useState } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";

type EventTab = "punctual" | "recurring-work" | "recurring-other";

interface DayCreateEventFormProps {
  action: EventFormAction;
  familyId: string;
  /** Pre-filled date in YYYY-MM-DD format */
  date: string;
  onCancel: () => void;
}

const TABS: { label: string; value: EventTab }[] = [
  { label: "Puntual", value: "punctual" },
  { label: "Trabajo/Estudio", value: "recurring-work" },
  { label: "Otro recurrente", value: "recurring-other" },
];

const SHIFT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "Mañana", value: "morning" },
  { label: "Día", value: "day" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noche", value: "night" },
];

const FREQUENCY_UNIT_OPTIONS: { label: string; value: string }[] = [
  { label: "Diaria", value: "daily" },
  { label: "Semanal", value: "weekly" },
  { label: "Anual", value: "annual" },
];

export function DayCreateEventForm({
  action,
  familyId,
  date,
  onCancel,
}: DayCreateEventFormProps) {
  const titleId = useId();
  const endDateId = useId();
  const startTimeId = useId();
  const endTimeId = useId();
  const descriptionId = useId();
  const categoryId = useId();
  const frequencyUnitId = useId();
  const frequencyIntervalId = useId();
  const shiftTypeId = useId();

  const [activeTab, setActiveTab] = useState<EventTab>("punctual");
  const [formState, formAction] = useActionState(
    action,
    EMPTY_EVENT_FORM_STATE,
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Nuevo evento</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </button>
      </div>

      <div className="mb-3 flex gap-1 rounded-lg bg-stone-200/60 p-0.5">
        {TABS.map((tab) => (
          <button
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="eventType" type="hidden" value={activeTab} />
        <input name="redirectTo" type="hidden" value="/calendar" />

        {/* Pre-fill date for punctual events */}
        {activeTab === "punctual" && (
          <input name="date" type="hidden" value={date} />
        )}

        {/* Pre-fill startDate for recurring events */}
        {activeTab !== "punctual" && (
          <input name="startDate" type="hidden" value={date} />
        )}

        {/* Title */}
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-slate-700"
            htmlFor={titleId}
          >
            Título
          </label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            id={titleId}
            name="title"
            type="text"
          />
          {formState.errors?.title && (
            <p className="text-xs text-red-600">{formState.errors.title}</p>
          )}
        </div>

        {/* Punctual: time fields */}
        {activeTab === "punctual" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={startTimeId}
              >
                Hora inicio
              </label>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={startTimeId}
                name="startTime"
                type="time"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={endTimeId}
              >
                Hora fin
              </label>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={endTimeId}
                name="endTime"
                type="time"
              />
            </div>
          </div>
        )}

        {/* Recurring work fields */}
        {activeTab === "recurring-work" && (
          <>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={categoryId}
              >
                Categoría
              </label>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={categoryId}
                name="category"
              >
                <option value="work">Trabajo</option>
                <option value="studies">Estudios</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={frequencyUnitId}
                >
                  Frecuencia
                </label>
                <select
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  id={frequencyUnitId}
                  name="frequencyUnit"
                >
                  {FREQUENCY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={frequencyIntervalId}
                >
                  Intervalo
                </label>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  defaultValue="1"
                  id={frequencyIntervalId}
                  min="1"
                  max="365"
                  name="frequencyInterval"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={shiftTypeId}
              >
                Tipo de turno
              </label>
              <select
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={shiftTypeId}
                name="shiftType"
              >
                {SHIFT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={endDateId}
              >
                Fecha de fin (opcional)
              </label>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={endDateId}
                name="endDate"
                type="date"
              />
            </div>
          </>
        )}

        {/* Recurring other fields */}
        {activeTab === "recurring-other" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={frequencyUnitId}
                >
                  Frecuencia
                </label>
                <select
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  id={frequencyUnitId}
                  name="frequencyUnit"
                >
                  {FREQUENCY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={frequencyIntervalId}
                >
                  Intervalo
                </label>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  defaultValue="1"
                  id={frequencyIntervalId}
                  min="1"
                  max="365"
                  name="frequencyInterval"
                  type="number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={startTimeId}
                >
                  Hora inicio
                </label>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  id={startTimeId}
                  name="startTime"
                  type="time"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium text-slate-700"
                  htmlFor={endTimeId}
                >
                  Hora fin
                </label>
                <input
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  id={endTimeId}
                  name="endTime"
                  type="time"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor={endDateId}
              >
                Fecha de fin (opcional)
              </label>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                id={endDateId}
                name="endDate"
                type="date"
              />
            </div>
          </>
        )}

        {/* Description */}
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-slate-700"
            htmlFor={descriptionId}
          >
            Descripción (opcional)
          </label>
          <textarea
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            id={descriptionId}
            name="description"
            rows={2}
          />
        </div>

        {formState.message && (
          <p className="rounded-lg bg-stone-100 px-3 py-2 text-xs text-slate-700">
            {formState.message}
          </p>
        )}

        <SubmitButton
          className="w-full"
          label="Crear evento"
          pendingLabel="Guardando..."
        />
      </form>
    </div>
  );
}
