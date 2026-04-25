"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import type { ProfileFormState } from "@/presentation/components/profile/profileTypes";
import { EMPTY_PROFILE_FORM_STATE } from "@/presentation/components/profile/profileTypes";

interface EditDisplayNameFormProps {
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  initialDisplayName: string;
  onSuccess: (message: string) => void;
}

export function EditDisplayNameForm({
  action,
  initialDisplayName,
  onSuccess,
}: EditDisplayNameFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_PROFILE_FORM_STATE);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (state.success && !prevSuccess.current) {
      onSuccess("Nombre actualizado correctamente.");
    }

    prevSuccess.current = state.success;
  }, [state.success, onSuccess]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Datos básicos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Actualiza el nombre que se muestra en la aplicación.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="displayName"
          >
            Nombre
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
            defaultValue={initialDisplayName}
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
          />
          {state.errors?.displayName ? (
            <p className="text-sm text-red-600">{state.errors.displayName}</p>
          ) : null}
        </div>

        {state.message && !state.success ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {state.message}
          </p>
        ) : null}

        <SubmitButton
          label="Guardar cambios"
          pendingLabel="Guardando..."
          className="w-full sm:w-auto"
        />
      </form>
    </section>
  );
}
