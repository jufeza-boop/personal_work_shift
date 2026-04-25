"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";
import {
  EMPTY_INVITATION_FORM_STATE,
  type InvitationFormState,
} from "@/presentation/components/family/invitationTypes";
import { ShareInvitationButton } from "@/presentation/components/family/ShareInvitationButton";

interface CreateInvitationFormProps {
  action: (
    prev: InvitationFormState,
    formData: FormData,
  ) => Promise<InvitationFormState>;
  familyId: string;
  familyName: string;
  redirectTo?: string;
}

export function CreateInvitationForm({
  action,
  familyId,
  familyName,
  redirectTo = "/calendar/settings",
}: CreateInvitationFormProps) {
  const [formState, formAction] = useActionState(
    action,
    EMPTY_INVITATION_FORM_STATE,
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Invitar por enlace
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Genera un enlace de invitación y compártelo por WhatsApp, Telegram o
        cualquier otro medio. El enlace caduca en 7 días.
      </p>

      {formState.success && formState.invitationUrl ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-sm font-medium text-emerald-800">
              {formState.message}
            </p>
            <p className="rounded-lg bg-white px-3 py-2 font-mono text-xs break-all text-slate-700 ring-1 ring-stone-200">
              {formState.invitationUrl}
            </p>
          </div>
          <ShareInvitationButton
            familyName={familyName}
            url={formState.invitationUrl}
          />
          <form action={formAction}>
            <input name="familyId" type="hidden" value={familyId} />
            <input name="redirectTo" type="hidden" value={redirectTo} />
            <SubmitButton
              className="text-sm"
              label="Generar otro enlace"
              pendingLabel="Generando..."
            />
          </form>
        </div>
      ) : (
        <form action={formAction} className="mt-4">
          <input name="familyId" type="hidden" value={familyId} />
          <input name="redirectTo" type="hidden" value={redirectTo} />

          {formState.message ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formState.message}
            </p>
          ) : null}

          <SubmitButton
            className="w-full"
            label="Generar enlace de invitación"
            pendingLabel="Generando..."
          />
        </form>
      )}
    </section>
  );
}
