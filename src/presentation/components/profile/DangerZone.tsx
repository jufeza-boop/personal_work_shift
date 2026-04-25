"use client";

import { useState, useTransition } from "react";
import { Spinner } from "@/presentation/components/ui/Spinner";
import type { AuthFormState } from "@/presentation/components/auth/types";

interface DangerZoneProps {
  deleteAccountAction: () => Promise<AuthFormState>;
}

export function DangerZone({ deleteAccountAction }: DangerZoneProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDeleteClick() {
    setError(null);
    setDialogOpen(true);
  }

  function handleCancel() {
    setDialogOpen(false);
    setError(null);
  }

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await deleteAccountAction();

      if (!result.success) {
        setError(result.message ?? "No se pudo eliminar la cuenta.");
      }
      // On success the server action redirects — no further handling needed.
    });
  }

  return (
    <>
      <section className="rounded-3xl border border-red-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">Zona de peligro</h2>
        <p className="mt-1 text-sm text-slate-600">
          Eliminar tu cuenta es una acción permanente e irreversible. Perderás
          todos tus turnos, familias y datos asociados.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            Eliminar cuenta
          </button>
        </div>
      </section>

      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="danger-zone-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h2
              id="danger-zone-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              ¿Eliminar tu cuenta?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Esta acción es{" "}
              <strong className="font-semibold text-red-700">
                permanente e irreversible
              </strong>
              . Se eliminarán todos tus turnos, familias y datos asociados. No
              podrás recuperar tu cuenta.
            </p>

            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Spinner size="sm" />
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar cuenta"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
