"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import type { ProfileFormState } from "@/app/actions/profile";
import { EMPTY_PROFILE_FORM_STATE } from "@/app/actions/profile";

interface ChangePasswordFormProps {
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  onSuccess: (message: string) => void;
}

export function ChangePasswordForm({
  action,
  onSuccess,
}: ChangePasswordFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_PROFILE_FORM_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (state.success && !prevSuccess.current) {
      onSuccess("Contraseña actualizada correctamente.");
      formRef.current?.reset();
    }

    prevSuccess.current = state.success;
  }, [state.success, onSuccess]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Cambiar contraseña
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Introduce una nueva contraseña. Debe tener al menos 8 caracteres, una
        mayúscula, una minúscula y un número.
      </p>

      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="newPassword"
          >
            Nueva contraseña
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
          />
          {state.errors?.newPassword ? (
            <p className="text-sm text-red-600">{state.errors.newPassword}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="confirmPassword"
          >
            Confirmar nueva contraseña
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
          />
          {state.errors?.confirmPassword ? (
            <p className="text-sm text-red-600">
              {state.errors.confirmPassword}
            </p>
          ) : null}
        </div>

        {state.message && !state.success ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {state.message}
          </p>
        ) : null}

        <SubmitButton
          label="Cambiar contraseña"
          pendingLabel="Actualizando..."
          className="w-full sm:w-auto"
        />
      </form>
    </section>
  );
}
