"use client";

import { useActionState, useId, useState } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
} from "@/presentation/components/events/types";

type EventTab = "punctual" | "recurring";

interface DayCreateEventFormProps {
  action: EventFormAction;
  familyId: string;
  /** Pre-filled date in YYYY-MM-DD format */
  date: string;
  delegatedUsers?: { id: string; displayName: string }[];
  redirectTo?: string;
  onCancel: () => void;
}

const TABS: { label: string; value: EventTab }[] = [
  { label: "Puntual", value: "punctual" },
  { label: "Recurrente", value: "recurring" },
];

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
  delegatedUsers = [],
  redirectTo = "/calendar",
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
  const targetUserId = useId();

  const [activeTab, setActiveTab] = useState<EventTab>("punctual");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formState, formAction] = useActionState(
    action,
    EMPTY_EVENT_FORM_STATE,
  );

  const needsShiftType =
    selectedCategory === "work" || selectedCategory === "studies";
  const hasTimeFields =
    selectedCategory === "" ||
    selectedCategory === "vacations" ||
    selectedCategory === "other";

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
            onClick={() => {
              setActiveTab(tab.value);
              setSelectedCategory(tab.value === "recurring" ? "work" : "");
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="eventType" type="hidden" value={activeTab} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        {/* Pre-fill date for punctual events */}
        {activeTab === "punctual" && (
          <input name="date" type="hidden" value={date} />
        )}

        {/* Pre-fill startDate for recurring events */}
        {activeTab !== "punctual" && (
          <input name="startDate" type="hidden" value={date} />
        )}

        {/* Optional delegated user selector */}
        {delegatedUsers.length > 0 && (
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor={targetUserId}
            >
              Crear para
            </label>
            <select
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              id={targetUserId}
              name="targetUserId"
            >
              <option value="">Yo mismo</option>
              {delegatedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>
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

        {/* Category selector — visible in both tabs */}
        <div className="space-y-1">
          <label
            className="text-xs font-medium text-slate-700"
            htmlFor={categoryId}
          >
            Categoría {activeTab === "recurring" ? "" : "(opcional)"}
          </label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            id={categoryId}
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {activeTab === "punctual"
              ? CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : CATEGORY_OPTIONS_REQUIRED.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
          </select>
          {formState.errors?.category && (
            <p className="text-xs text-red-600">{formState.errors.category}</p>
          )}
        </div>

        {/* Shift type — only when work or studies */}
        {needsShiftType && (
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
            {formState.errors?.shiftType && (
              <p className="text-xs text-red-600">
                {formState.errors.shiftType}
              </p>
            )}
          </div>
        )}

        {/* Time fields for non-shift categories */}
        {hasTimeFields && (
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

        {/* Recurring-specific: frequency and end date */}
        {activeTab === "recurring" && (
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
                min={date}
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
