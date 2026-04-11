"use client";

import { useActionState, useId, useState } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";

type EventTab = "punctual" | "recurring-work" | "recurring-other";

interface CreateEventFormProps {
  action: EventFormAction;
  familyId: string;
  redirectTo?: string;
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

export function CreateEventForm({
  action,
  familyId,
  redirectTo = "/calendar",
}: CreateEventFormProps) {
  const titleId = useId();
  const dateId = useId();
  const startDateId = useId();
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
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Crear evento</h2>

      <div className="mt-4 flex gap-1 rounded-xl bg-stone-100 p-1">
        {TABS.map((tab) => (
          <button
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="eventType" type="hidden" value={activeTab} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        {/* Title — always visible */}
        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={titleId}
          >
            Título
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={titleId}
            name="title"
            type="text"
          />
          {formState.errors?.title ? (
            <p className="text-sm text-red-600">{formState.errors.title}</p>
          ) : null}
        </div>

        {/* Punctual fields */}
        {activeTab === "punctual" ? (
          <>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={dateId}
              >
                Fecha
              </label>
              <input
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={dateId}
                name="date"
                type="date"
              />
              {formState.errors?.date ? (
                <p className="text-sm text-red-600">{formState.errors.date}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={startTimeId}
                >
                  Hora inicio (opcional)
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={startTimeId}
                  name="startTime"
                  type="time"
                />
                {formState.errors?.startTime ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.startTime}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={endTimeId}
                >
                  Hora fin (opcional)
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={endTimeId}
                  name="endTime"
                  type="time"
                />
                {formState.errors?.endTime ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.endTime}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {/* Recurring work/studies fields */}
        {activeTab === "recurring-work" ? (
          <>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={categoryId}
              >
                Categoría
              </label>
              <select
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={categoryId}
                name="category"
              >
                <option value="work">Trabajo</option>
                <option value="studies">Estudios</option>
              </select>
              {formState.errors?.category ? (
                <p className="text-sm text-red-600">
                  {formState.errors.category}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={startDateId}
              >
                Fecha de inicio
              </label>
              <input
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={startDateId}
                name="startDate"
                type="date"
              />
              {formState.errors?.startDate ? (
                <p className="text-sm text-red-600">
                  {formState.errors.startDate}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={frequencyUnitId}
                >
                  Frecuencia
                </label>
                <select
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={frequencyUnitId}
                  name="frequencyUnit"
                >
                  {FREQUENCY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formState.errors?.frequencyUnit ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.frequencyUnit}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={frequencyIntervalId}
                >
                  Intervalo
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  defaultValue="1"
                  id={frequencyIntervalId}
                  min="1"
                  max="365"
                  name="frequencyInterval"
                  type="number"
                />
                {formState.errors?.frequencyInterval ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.frequencyInterval}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={shiftTypeId}
              >
                Tipo de turno
              </label>
              <select
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={shiftTypeId}
                name="shiftType"
              >
                {SHIFT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {formState.errors?.shiftType ? (
                <p className="text-sm text-red-600">
                  {formState.errors.shiftType}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={endDateId}
              >
                Fecha de fin (opcional)
              </label>
              <input
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={endDateId}
                name="endDate"
                type="date"
              />
              {formState.errors?.endDate ? (
                <p className="text-sm text-red-600">
                  {formState.errors.endDate}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {/* Recurring other fields */}
        {activeTab === "recurring-other" ? (
          <>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={startDateId}
              >
                Fecha de inicio
              </label>
              <input
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={startDateId}
                name="startDate"
                type="date"
              />
              {formState.errors?.startDate ? (
                <p className="text-sm text-red-600">
                  {formState.errors.startDate}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={frequencyUnitId}
                >
                  Frecuencia
                </label>
                <select
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={frequencyUnitId}
                  name="frequencyUnit"
                >
                  {FREQUENCY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formState.errors?.frequencyUnit ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.frequencyUnit}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={frequencyIntervalId}
                >
                  Intervalo
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  defaultValue="1"
                  id={frequencyIntervalId}
                  min="1"
                  max="365"
                  name="frequencyInterval"
                  type="number"
                />
                {formState.errors?.frequencyInterval ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.frequencyInterval}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={startTimeId}
                >
                  Hora inicio (opcional)
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={startTimeId}
                  name="startTime"
                  type="time"
                />
                {formState.errors?.startTime ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.startTime}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor={endTimeId}
                >
                  Hora fin (opcional)
                </label>
                <input
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                  id={endTimeId}
                  name="endTime"
                  type="time"
                />
                {formState.errors?.endTime ? (
                  <p className="text-sm text-red-600">
                    {formState.errors.endTime}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor={endDateId}
              >
                Fecha de fin (opcional)
              </label>
              <input
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
                id={endDateId}
                name="endDate"
                type="date"
              />
              {formState.errors?.endDate ? (
                <p className="text-sm text-red-600">
                  {formState.errors.endDate}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        {/* Description — always visible */}
        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={descriptionId}
          >
            Descripción (opcional)
          </label>
          <textarea
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={descriptionId}
            name="description"
            rows={2}
          />
          {formState.errors?.description ? (
            <p className="text-sm text-red-600">
              {formState.errors.description}
            </p>
          ) : null}
        </div>

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <SubmitButton
          className="w-full"
          label="Crear evento"
          pendingLabel="Guardando..."
        />
      </form>
    </section>
  );
}
