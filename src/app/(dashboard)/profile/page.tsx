import { redirect } from "next/navigation";
import { deleteAccountAction } from "@/app/actions/auth";
import {
  updateDisplayNameAction,
  updateProfilePasswordAction,
} from "@/app/actions/profile";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerAuthDependencies } from "@/infrastructure/auth/runtime";
import { ProfilePageClient } from "@/presentation/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/profile");
  }

  const { userRepository } = await createServerAuthDependencies();
  const user = await userRepository.findById(currentUser.id);

  const displayName = user?.displayName ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
        Mi Perfil
      </h1>

      <ProfilePageClient
        initialDisplayName={displayName}
        updateDisplayNameAction={updateDisplayNameAction}
        updatePasswordAction={updateProfilePasswordAction}
        deleteAccountAction={deleteAccountAction}
      />
    </div>
  );
}
