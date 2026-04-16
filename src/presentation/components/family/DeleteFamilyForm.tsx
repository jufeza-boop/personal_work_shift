"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/presentation/components/ui/Spinner";

interface DeleteFamilyFormProps {
  action: (formData: FormData) => Promise<void>;
  familyId: string;
  familyName: string;
  redirectTo?: string;
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          Eliminando...
        </span>
      ) : (
        "Eliminar familia"
      )}
    </button>
  );
}

export function DeleteFamilyForm({
  action,
  familyId,
  familyName,
  redirectTo = "/calendar",
}: DeleteFamilyFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!showConfirmation) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Zona de peligro</h2>
        <p className="mt-2 text-sm leading-6 text-red-800">
          Eliminar esta familia borrara todos los eventos y miembros asociados.
          Esta accion no se puede deshacer.
        </p>

        <div className="mt-4">
          <button
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            onClick={() => setShowConfirmation(true)}
            type="button"
          >
            Eliminar familia...
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-red-300 bg-red-50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-red-900">
        Confirmar eliminacion
      </h2>
      <p className="mt-2 text-sm leading-6 text-red-800">
        Estas seguro de que quieres eliminar <strong>{familyName}</strong>? Se
        eliminaran todos los eventos y miembros. Esta accion es irreversible.
      </p>

      <form action={action} className="mt-4 flex items-center gap-3">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <DeleteButton />
        <button
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-stone-50"
          onClick={() => setShowConfirmation(false)}
          type="button"
        >
          Cancelar
        </button>
      </form>
    </section>
  );
}
