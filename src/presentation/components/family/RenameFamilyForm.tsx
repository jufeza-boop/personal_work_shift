"use client";

import { useActionState, useId } from "react";
import { Button } from "@/presentation/components/ui/button";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface RenameFamilyFormProps {
  action: FamilyFormAction;
  familyId: string;
  initialName: string;
  redirectTo?: string;
}

export function RenameFamilyForm({
  action,
  familyId,
  initialName,
  redirectTo = "/calendar/settings",
}: RenameFamilyFormProps) {
  const inputId = useId();
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Ajustes de la familia
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Cambia el nombre visible del grupo para reflejar mejor su propósito.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={inputId}
          >
            Nombre de la familia
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            defaultValue={initialName}
            id={inputId}
            name="name"
            type="text"
          />
          {formState.errors?.name ? (
            <p className="text-sm text-red-600">{formState.errors.name}</p>
          ) : null}
        </div>

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <Button type="submit">Guardar nombre</Button>
      </form>
    </section>
  );
}
