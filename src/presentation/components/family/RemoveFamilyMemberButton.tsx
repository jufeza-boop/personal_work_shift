"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface RemoveFamilyMemberButtonProps {
  action: FamilyFormAction;
  familyId: string;
  memberName: string;
  memberUserId: string;
}

export function RemoveFamilyMemberButton({
  action,
  familyId,
  memberName,
  memberUserId,
}: RemoveFamilyMemberButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  if (!showConfirm) {
    return (
      <button
        aria-label={`Eliminar a ${memberName}`}
        className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        onClick={() => setShowConfirm(true)}
        type="button"
      >
        <Trash2 className="h-3 w-3" />
        Quitar
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-stone-300 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-stone-100"
          onClick={() => setShowConfirm(false)}
          type="button"
        >
          Cancelar
        </button>
        <form action={formAction}>
          <input name="familyId" type="hidden" value={familyId} />
          <input name="memberUserId" type="hidden" value={memberUserId} />
          <SubmitButton
            className="border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            label="Confirmar"
            pendingLabel="Quitando..."
          />
        </form>
      </div>
      {formState.message ? (
        <p
          className={`rounded-lg px-3 py-1 text-xs ${
            formState.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {formState.message}
        </p>
      ) : null}
    </div>
  );
}
