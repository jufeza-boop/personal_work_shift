"use client";

import { useState, useActionState, useId } from "react";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import { ColorPalettePicker } from "@/presentation/components/family/ColorPalettePicker";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface CreateFamilyFormProps {
  action: FamilyFormAction;
  paletteOptions?: PaletteOption[];
  redirectTo?: string;
}

export function CreateFamilyForm({
  action,
  paletteOptions,
  redirectTo = "/calendar",
}: CreateFamilyFormProps) {
  const inputId = useId();
  const colorPickerId = useId();
  const effectivePaletteOptions =
    paletteOptions ??
    ColorPalette.availablePalettes().map((name) => ({ name, disabled: false }));
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(undefined);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Crear familia</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Añade un nuevo grupo para separar contextos como casa, trabajo o
        estudios.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
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
            id={inputId}
            name="name"
            type="text"
          />
          {formState.errors?.name ? (
            <p className="text-sm text-red-600">{formState.errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={colorPickerId}
          >
            Mi paleta de color
          </label>
          <ColorPalettePicker
            id={colorPickerId}
            name="colorPalette"
            paletteOptions={effectivePaletteOptions}
            value={selectedPalette}
            onChange={setSelectedPalette}
            error={formState.errors?.colorPalette}
          />
        </div>

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <SubmitButton
          className="w-full"
          label="Crear familia"
          pendingLabel="Creando..."
        />
      </form>
    </section>
  );
}
