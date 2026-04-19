"use client";

import { useActionState, useState } from "react";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import {
  ColorPalettePicker,
  type PaletteOption,
} from "@/presentation/components/family/ColorPalettePicker";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface AssignDelegatedMemberPaletteFormProps {
  action: FamilyFormAction;
  familyId: string;
  targetUserId: string;
  memberName: string;
  currentPalette?: ColorPaletteName;
  paletteOptions: PaletteOption[];
}

export function AssignDelegatedMemberPaletteForm({
  action,
  familyId,
  targetUserId,
  memberName,
  currentPalette,
  paletteOptions,
}: AssignDelegatedMemberPaletteFormProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(currentPalette);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  if (!showPicker) {
    return (
      <button
        className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-stone-100"
        onClick={() => setShowPicker(true)}
        type="button"
      >
        {currentPalette ? "Cambiar paleta" : "Asignar paleta"}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-slate-800">
        Paleta de {memberName}
      </p>
      <form action={formAction} className="space-y-3">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="targetUserId" type="hidden" value={targetUserId} />
        <input name="redirectTo" type="hidden" value="/calendar/settings" />

        <ColorPalettePicker
          name="colorPalette"
          paletteOptions={paletteOptions}
          value={selectedPalette}
          onChange={setSelectedPalette}
          error={formState.errors?.colorPalette}
        />

        {formState.message ? (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {formState.message}
          </p>
        ) : null}

        <div className="flex gap-2">
          <SubmitButton label="Guardar paleta" pendingLabel="Guardando..." />
          <button
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-stone-100"
            onClick={() => {
              setShowPicker(false);
              setSelectedPalette(currentPalette);
            }}
            type="button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
