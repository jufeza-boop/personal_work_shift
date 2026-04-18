"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface DelegatedUserCardProps {
  delegatedUserId: string;
  displayName: string;
  removeAction: FamilyFormAction;
  renameAction: FamilyFormAction;
}

export function DelegatedUserCard({
  delegatedUserId,
  displayName,
  removeAction,
  renameAction,
}: DelegatedUserCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [removeFormState, removeFormAction] = useActionState(
    removeAction,
    EMPTY_FAMILY_FORM_STATE,
  );
  const [renameFormState, renameFormAction] = useActionState(
    renameAction,
    EMPTY_FAMILY_FORM_STATE,
  );

  const formState = isEditing ? renameFormState : removeFormState;

  return (
    <li className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <form
            action={renameFormAction}
            className="flex flex-1 items-center gap-2"
          >
            <input
              name="delegatedUserId"
              type="hidden"
              value={delegatedUserId}
            />
            <input
              name="redirectTo"
              type="hidden"
              value="/calendar/delegated-users"
            />
            <input
              className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
              name="displayName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
            <SubmitButton
              className="border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              label="Guardar"
              pendingLabel="Guardando..."
            />
            <button
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-stone-100"
              onClick={() => {
                setIsEditing(false);
                setEditName(displayName);
              }}
              type="button"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
            <div>
              <p className="font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">Usuario delegado</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-stone-100"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>

              {!showConfirm ? (
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  onClick={() => setShowConfirm(true)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-stone-100"
                    onClick={() => setShowConfirm(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <form action={removeFormAction}>
                    <input
                      name="delegatedUserId"
                      type="hidden"
                      value={delegatedUserId}
                    />
                    <input
                      name="redirectTo"
                      type="hidden"
                      value="/calendar/delegated-users"
                    />
                    <SubmitButton
                      className="border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                      label="Confirmar"
                      pendingLabel="Eliminando..."
                    />
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
    </li>
  );
}
