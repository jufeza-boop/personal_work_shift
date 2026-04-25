"use client";

import { useActionState, useState, useId } from "react";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalettePicker } from "@/presentation/components/family/ColorPalettePicker";
import type { PaletteOption } from "@/presentation/components/family/ColorPalettePicker";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_INVITATION_FORM_STATE,
  type InvitationFormState,
} from "@/presentation/components/family/invitationTypes";

interface AcceptInvitationFormProps {
  action: (
    prev: InvitationFormState,
    formData: FormData,
  ) => Promise<InvitationFormState>;
  familyName: string;
  paletteOptions: PaletteOption[];
  token: string;
}

export function AcceptInvitationForm({
  action,
  familyName,
  paletteOptions,
  token,
}: AcceptInvitationFormProps) {
  const colorPickerId = useId();
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(undefined);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_INVITATION_FORM_STATE,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input name="token" type="hidden" value={token} />

      <div>
        <p className="text-base text-slate-700">
          Estás a punto de unirte a la familia{" "}
          <span className="font-semibold text-slate-900">{familyName}</span>.
          Elige una paleta de color para identificarte en el calendario.
        </p>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor={colorPickerId}
        >
          Paleta de color
        </label>
        <ColorPalettePicker
          error={formState.errors?.colorPalette}
          id={colorPickerId}
          name="colorPalette"
          onChange={setSelectedPalette}
          paletteOptions={paletteOptions}
          value={selectedPalette}
        />
      </div>

      {formState.message && !formState.success ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formState.message}
        </p>
      ) : null}

      <SubmitButton
        className="w-full"
        label="Aceptar invitación"
        pendingLabel="Uniéndome..."
      />
    </form>
  );
}
