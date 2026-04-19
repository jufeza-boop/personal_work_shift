"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface LeaveFamilyFormProps {
  action: FamilyFormAction;
  familyId: string;
  familyName: string;
}

export function LeaveFamilyForm({
  action,
  familyId,
  familyName,
}: LeaveFamilyFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Abandonar familia
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Si abandonas <strong>{familyName}</strong>, dejarás de ver su calendario
        y sus eventos. Esta acción no se puede deshacer.
      </p>

      {formState.message ? (
        <p
          className={`mt-3 rounded-xl px-4 py-2 text-sm ${
            formState.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {formState.message}
        </p>
      ) : null}

      {!showConfirm ? (
        <button
          className="mt-4 rounded-xl border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
          onClick={() => setShowConfirm(true)}
          type="button"
        >
          Abandonar familia
        </button>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
            onClick={() => setShowConfirm(false)}
            type="button"
          >
            Cancelar
          </button>
          <form action={formAction}>
            <input name="familyId" type="hidden" value={familyId} />
            <SubmitButton
              className="border border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200"
              label="Sí, abandonar"
              pendingLabel="Abandonando..."
            />
          </form>
        </div>
      )}
    </section>
  );
}
