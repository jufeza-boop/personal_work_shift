"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormAction,
  type EventFormState,
} from "@/presentation/components/events/types";

type EventTab = "punctual" | "recurring";

interface CreateEventFormProps {
  action: EventFormAction;
  familyId: string;
  redirectTo?: string;
}

interface FieldProps {
  formState: EventFormState;
  selectedCategory: string;
  startTimeId: string;
  endTimeId: string;
}

interface PunctualFieldsProps extends FieldProps {
  dateId: string;
}

interface RecurringFieldsProps extends FieldProps {
  startDateId: string;
  endDateId: string;
  frequencyUnitId: string;
  frequencyIntervalId: string;
  onStartDateChange: (value: string) => void;
  startDateValue: string;
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

function FieldError({ message }: Readonly<{ message?: string }>) {
  return message ? (
    <p className="text-sm text-red-600">{message}</p>
  ) : null;
}

function TimeFields({
  formState,
  startTimeId,
  endTimeId,
}: Readonly<Pick<FieldProps, "formState" | "startTimeId" | "endTimeId">>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800" htmlFor={startTimeId}>
          Hora inicio (opcional)
        </label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
          id={startTimeId}
          name="startTime"
          type="time"
        />
        <FieldError message={formState.errors?.startTime} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800" htmlFor={endTimeId}>
          Hora fin (opcional)
        </label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
          id={endTimeId}
          name="endTime"
          type="time"
        />
        <FieldError message={formState.errors?.endTime} />
      </div>
    </div>
  );
}

function PunctualFields({
  formState,
  selectedCategory,
  dateId,
  startTimeId,
  endTimeId,
}: Readonly<PunctualFieldsProps>) {
  const hasTimeFields =
    selectedCategory === "" ||
    selectedCategory === "vacations" ||
    selectedCategory === "other";

  return (
    <>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800" htmlFor={dateId}>
          Fecha
        </label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
          id={dateId}
          name="date"
          type="date"
        />
        <FieldError message={formState.errors?.date} />
      </div>
      {hasTimeFields ? (
        <TimeFields
          formState={formState}
          startTimeId={startTimeId}
          endTimeId={endTimeId}
        />
      ) : null}
    </>
  );
}

function RecurringFields({
  formState,
  selectedCategory,
  startDateId,
  endDateId,
  frequencyUnitId,
  frequencyIntervalId,
  startTimeId,
  endTimeId,
  onStartDateChange,
  startDateValue,
}: Readonly<RecurringFieldsProps>) {
  const hasTimeFields =
    selectedCategory === "" ||
    selectedCategory === "vacations" ||
    selectedCategory === "other";

  return (
    <>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800" htmlFor={startDateId}>
          Fecha de inicio
        </label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
          id={startDateId}
          name="startDate"
          type="date"
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <FieldError message={formState.errors?.startDate} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800" htmlFor={frequencyUnitId}>
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
          <FieldError message={formState.errors?.frequencyUnit} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800" htmlFor={frequencyIntervalId}>
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
          <FieldError message={formState.errors?.frequencyInterval} />
        </div>
      </div>

      {hasTimeFields ? (
        <TimeFields
          formState={formState}
          startTimeId={startTimeId}
          endTimeId={endTimeId}
        />
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800" htmlFor={endDateId}>
          Fecha de fin (opcional)
        </label>
        <input
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
          id={endDateId}
          name="endDate"
          type="date"
          min={startDateValue || undefined}
        />
        <FieldError message={formState.errors?.endDate} />
      </div>
    </>
  );
}

export function CreateEventForm({
  action,
  familyId,
  redirectTo = "/calendar",
}: Readonly<CreateEventFormProps>) {
  const router = useRouter();
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
  const [startDateValue, setStartDateValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formState, formAction] = useActionState(
    action,
    EMPTY_EVENT_FORM_STATE,
  );

  const needsShiftType =
    selectedCategory === "work" || selectedCategory === "studies";

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
              setStartDateValue("");
              setSelectedCategory(tab.value === "recurring" ? "work" : "");
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
          <label className="text-sm font-medium text-slate-800" htmlFor={titleId}>
            Título
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={titleId}
            name="title"
            type="text"
          />
          <FieldError message={formState.errors?.title} />
        </div>

        {/* Category selector — visible in both tabs */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800" htmlFor={categoryId}>
            Categoría {activeTab === "recurring" ? "" : "(opcional)"}
          </label>
          <select
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
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
          <FieldError message={formState.errors?.category} />
        </div>

        {/* Shift type — only when work or studies */}
        {needsShiftType ? (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor={shiftTypeId}>
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
            <FieldError message={formState.errors?.shiftType} />
          </div>
        ) : null}

        {/* Punctual-specific fields */}
        {activeTab === "punctual" ? (
          <PunctualFields
            formState={formState}
            selectedCategory={selectedCategory}
            dateId={dateId}
            startTimeId={startTimeId}
            endTimeId={endTimeId}
          />
        ) : null}

        {/* Recurring-specific fields */}
        {activeTab === "recurring" ? (
          <RecurringFields
            formState={formState}
            selectedCategory={selectedCategory}
            startDateId={startDateId}
            endDateId={endDateId}
            frequencyUnitId={frequencyUnitId}
            frequencyIntervalId={frequencyIntervalId}
            startTimeId={startTimeId}
            endTimeId={endTimeId}
            onStartDateChange={setStartDateValue}
            startDateValue={startDateValue}
          />
        ) : null}

        {/* Description — always visible */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800" htmlFor={descriptionId}>
            Descripción (opcional)
          </label>
          <textarea
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={descriptionId}
            name="description"
            rows={2}
          />
          <FieldError message={formState.errors?.description} />
        </div>

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <SubmitButton
            className="flex-1"
            label="Crear evento"
            pendingLabel="Guardando..."
          />
        </div>
      </form>
    </section>
  );
}
