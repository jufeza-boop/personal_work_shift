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

interface DelegatedUserOption {
  id: string;
  displayName: string;
}

interface AddDelegatedUserToFamilyFormProps {
  action: FamilyFormAction;
  availableDelegatedUsers: DelegatedUserOption[];
  familyId: string;
  paletteOptions: PaletteOption[];
  redirectTo?: string;
}

export function AddDelegatedUserToFamilyForm({
  action,
  availableDelegatedUsers,
  familyId,
  paletteOptions,
  redirectTo = "/calendar/settings",
}: AddDelegatedUserToFamilyFormProps) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<
    ColorPaletteName | undefined
  >(undefined);
  const [formState, formAction] = useActionState(
    action,
    EMPTY_FAMILY_FORM_STATE,
  );

  if (availableDelegatedUsers.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Añadir usuario delegado a esta familia
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Selecciona uno de tus usuarios delegados que aún no pertenece a esta
        familia.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input name="familyId" type="hidden" value={familyId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="delegatedUserId"
          >
            Usuario delegado
          </label>
          <select
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
            id="delegatedUserId"
            name="delegatedUserId"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Seleccionar usuario...</option>
            {availableDelegatedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName}
              </option>
            ))}
          </select>
        </div>

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

        {formState.message ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              formState.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {formState.message}
          </p>
        ) : null}

        <SubmitButton label="Añadir a la familia" pendingLabel="Añadiendo..." />
      </form>
    </section>
  );
}
