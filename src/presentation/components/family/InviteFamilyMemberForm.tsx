"use client";

import { useState, useActionState, useId } from "react";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalettePicker } from "@/presentation/components/family/ColorPalettePicker";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormAction,
} from "@/presentation/components/family/types";

interface InviteFamilyMemberFormProps {
  action: FamilyFormAction;
  familyId: string;
  paletteOptions: PaletteOption[];
  redirectTo?: string;
}

export function InviteFamilyMemberForm({
  action,
  familyId,
  paletteOptions,
  redirectTo = "/calendar/settings",
}: InviteFamilyMemberFormProps) {
  const emailId = useId();
  const colorPickerId = useId();
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(undefined);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Invitar miembro</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Invita por correo a alguien que ya tenga cuenta y asígnale una paleta
        libre.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={emailId}
          >
            Correo electrónico
          </label>
          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id={emailId}
            name="email"
            type="email"
          />
          {formState.errors?.email ? (
            <p className="text-sm text-red-600">{formState.errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor={colorPickerId}
          >
            Paleta de color
          </label>
          <ColorPalettePicker
            id={colorPickerId}
            name="colorPalette"
            paletteOptions={paletteOptions}
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
          label="Añadir miembro"
          pendingLabel="Añadiendo..."
        />
      </form>
    </section>
  );
}
