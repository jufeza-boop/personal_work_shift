"use client";

import { useActionState, useState } from "react";
import type { InvitationStatus } from "@/domain/entities/Invitation";
import {
  EMPTY_INVITATION_FORM_STATE,
  type InvitationFormState,
} from "@/presentation/components/family/invitationTypes";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";

interface SerializedInvitation {
  createdAt: string;
  expiresAt: string;
  familyName: string;
  id: string;
  status: InvitationStatus;
  token: string;
  usedAt: string | null;
  usedBy: string | null;
}

interface InvitationListProps {
  cancelAction: (
    prev: InvitationFormState,
    formData: FormData,
  ) => Promise<InvitationFormState>;
  familyId: string;
  invitations: SerializedInvitation[];
  siteUrl: string;
}

const STATUS_LABELS: Record<InvitationStatus, string> = {
  active: "Activa",
  cancelled: "Cancelada",
  expired: "Caducada",
  used: "Usada",
};

const STATUS_COLORS: Record<InvitationStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-100 text-stone-600",
  expired: "bg-amber-100 text-amber-800",
  used: "bg-blue-100 text-blue-800",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function computeDisplayStatus(inv: SerializedInvitation): InvitationStatus {
  if (inv.status === "used" || inv.status === "cancelled") {
    return inv.status;
  }

  return new Date() > new Date(inv.expiresAt) ? "expired" : "active";
}

function InvitationRow({
  cancelAction,
  familyId,
  invitation,
  siteUrl,
}: {
  cancelAction: InvitationListProps["cancelAction"];
  familyId: string;
  invitation: SerializedInvitation;
  siteUrl: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [formState, formAction] = useActionState(
    cancelAction,
    EMPTY_INVITATION_FORM_STATE,
  );
  const displayStatus = computeDisplayStatus(invitation);
  const invitationUrl = `${siteUrl}/invite/${invitation.token}`;

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[displayStatus]}`}
          >
            {STATUS_LABELS[displayStatus]}
          </span>
          <span className="text-xs text-slate-500">
            Caduca: {formatDate(invitation.expiresAt)}
          </span>
        </div>

        {displayStatus === "active" ? (
          <p className="mt-1 font-mono text-xs break-all text-slate-600">
            {invitationUrl}
          </p>
        ) : null}

        {invitation.usedAt ? (
          <p className="mt-1 text-xs text-slate-500">
            Usada el {formatDate(invitation.usedAt)}
          </p>
        ) : null}

        {formState.message && !formState.success ? (
          <p className="mt-1 text-xs text-red-600">{formState.message}</p>
        ) : null}
      </div>

      {displayStatus === "active" ? (
        <div className="flex shrink-0 gap-2">
          {showConfirm ? (
            <form action={formAction} className="flex gap-2">
              <input name="familyId" type="hidden" value={familyId} />
              <input name="invitationId" type="hidden" value={invitation.id} />
              <input
                name="redirectTo"
                type="hidden"
                value="/calendar/settings"
              />
              <SubmitButton
                className="rounded-xl bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                label="Confirmar"
                pendingLabel="Cancelando..."
              />
              <button
                className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-stone-50"
                onClick={() => setShowConfirm(false)}
                type="button"
              >
                Volver
              </button>
            </form>
          ) : (
            <button
              className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-50"
              onClick={() => setShowConfirm(true)}
              type="button"
            >
              Cancelar
            </button>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function InvitationList({
  cancelAction,
  familyId,
  invitations,
  siteUrl,
}: InvitationListProps) {
  if (invitations.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay invitaciones generadas aún.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {invitations.map((inv) => (
        <InvitationRow
          cancelAction={cancelAction}
          familyId={familyId}
          invitation={inv}
          key={inv.id}
          siteUrl={siteUrl}
        />
      ))}
    </ul>
  );
}
