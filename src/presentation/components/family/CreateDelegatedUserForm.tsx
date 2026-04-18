"use client";

import { useActionState, useId, useState } from "react";
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

interface CreateDelegatedUserFormProps {
  action: FamilyFormAction;
  familyId: string;
  paletteOptions?: PaletteOption[];
  redirectTo?: string;
}

export function CreateDelegatedUserForm({
  action,
  familyId,
  paletteOptions,
  redirectTo = "/calendar/settings",
}: CreateDelegatedUserFormProps) {
  const displayNameId = useId();
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(undefined);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Añadir usuario delegado
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Crea un usuario delegado (por ejemplo, un hijo o familiar) que no
        necesita cuenta propia. Tú gestionarás sus eventos en su nombre.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={displayNameId}
          >
            Nombre
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={displayNameId}
            name="displayName"
            placeholder="p. ej. Junior"
            type="text"
          />
          {formState.errors?.displayName ? (
            <p className="text-sm text-red-600">
              {formState.errors.displayName}
            </p>
          ) : null}
        </div>

        {paletteOptions ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">
              Paleta de color (opcional)
            </p>
            <ColorPalettePicker
              name="colorPalette"
              paletteOptions={paletteOptions}
              value={selectedPalette}
              onChange={setSelectedPalette}
            />
          </div>
        ) : null}

        {formState.message ? (
          <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
            {formState.message}
          </p>
        ) : null}

        <SubmitButton
          label="Crear usuario delegado"
          pendingLabel="Creando..."
        />
      </form>
    </section>
  );
}
