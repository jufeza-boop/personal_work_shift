"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Trash2, User, Users } from "lucide-react";

interface UserMenuProps {
  email: string;
  logoutAction: () => Promise<void>;
  deleteAccountAction: () => Promise<{ message?: string; success: boolean }>;
}

export function UserMenu({
  email,
  logoutAction,
  deleteAccountAction,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const initial = email.charAt(0).toUpperCase();

  function handleDeleteClick() {
    setOpen(false);
    setDeleteError(null);
    setConfirmingDelete(true);
  }

  async function handleConfirmDelete() {
    setDeleteError(null);
    const result = await deleteAccountAction();

    if (!result.success) {
      setDeleteError(result.message ?? "No se pudo eliminar la cuenta.");
      // Keep the dialog open so the user can see the error message.
    }
    // On success the server action redirects, so no further handling needed.
  }

  return (
    <>
      <details
        data-testid="user-menu"
        open={open}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="group relative"
      >
        <summary
          aria-label="Menú de usuario"
          onClick={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {initial}
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="truncate text-sm text-slate-700">{email}</p>
          </div>
          <div className="p-1">
            <Link
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 hover:text-slate-900"
              href="/calendar/delegated-users"
              onClick={() => setOpen(false)}
            >
              <Users className="h-4 w-4 text-slate-400" />
              Usuarios delegados
            </Link>
            <form action={logoutAction}>
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 hover:text-slate-900"
                type="submit"
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                Cerrar sesión
              </button>
            </form>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              type="button"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </details>

      {confirmingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h2
              id="delete-account-title"
              className="text-lg font-semibold text-slate-900"
            >
              ¿Eliminar tu cuenta?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Esta acción es permanente. Se eliminarán todos tus datos, eventos
              y configuraciones. No podrás recuperar tu cuenta.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50"
                type="button"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                type="button"
                onClick={handleConfirmDelete}
              >
                Sí, eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
