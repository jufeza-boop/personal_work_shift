"use client";

import { useCallback } from "react";
import type { ProfileFormState } from "@/app/actions/profile";
import { ChangePasswordForm } from "@/presentation/components/profile/ChangePasswordForm";
import { DangerZone } from "@/presentation/components/profile/DangerZone";
import { EditDisplayNameForm } from "@/presentation/components/profile/EditDisplayNameForm";
import { ToastList } from "@/presentation/components/ui/ToastList";
import { useToast } from "@/presentation/hooks/useToast";
import type { AuthFormState } from "@/presentation/components/auth/types";

interface ProfilePageClientProps {
  deleteAccountAction: () => Promise<AuthFormState>;
  initialDisplayName: string;
  updateDisplayNameAction: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  updatePasswordAction: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
}

export function ProfilePageClient({
  initialDisplayName,
  updateDisplayNameAction,
  updatePasswordAction,
  deleteAccountAction: deleteAction,
}: ProfilePageClientProps) {
  const { addToast, removeToast, toasts } = useToast();

  const handleSuccess = useCallback(
    (message: string) => {
      addToast(message, "success");
    },
    [addToast],
  );

  return (
    <>
      <div className="space-y-6">
        <EditDisplayNameForm
          action={updateDisplayNameAction}
          initialDisplayName={initialDisplayName}
          onSuccess={handleSuccess}
        />

        <ChangePasswordForm
          action={updatePasswordAction}
          onSuccess={handleSuccess}
        />

        <DangerZone deleteAccountAction={deleteAction} />
      </div>

      <ToastList toasts={toasts} onRemove={removeToast} />
    </>
  );
}
