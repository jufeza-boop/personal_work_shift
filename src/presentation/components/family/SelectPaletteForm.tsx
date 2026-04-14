"use client";

import { useState, useActionState } from "react";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalettePicker } from "@/presentation/components/family/ColorPalettePicker";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface SelectPaletteFormProps {
  action: FamilyFormAction;
  familyId: string;
  paletteOptions: PaletteOption[];
  currentPalette?: ColorPaletteName;
  redirectTo?: string;
}

export function SelectPaletteForm({
  action,
  familyId,
  paletteOptions,
  currentPalette,
  redirectTo = "/calendar/settings",
}: SelectPaletteFormProps) {
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(currentPalette);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Mi paleta</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Elige el conjunto de colores con el que aparecerán tus turnos en el
        calendario. Las paletas ya ocupadas por otros miembros están
        desactivadas.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <ColorPalettePicker
          name="colorPalette"
          paletteOptions={paletteOptions}
          value={selectedPalette}
          onChange={setSelectedPalette}
          error={formState.errors?.colorPalette}
        />

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <SubmitButton
          className="w-full"
          label="Guardar paleta"
          pendingLabel="Guardando..."
        />
      </form>
    </section>
  );
}
