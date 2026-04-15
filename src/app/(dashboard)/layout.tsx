import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerFamilyDependencies } from "@/infrastructure/family/runtime";
import {
  ACTIVE_FAMILY_COOKIE,
  resolveActiveItem,
} from "@/shared/family/activeFamily";
import { AppNavBar } from "@/presentation/components/ui/AppNavBar";

const CALENDAR_REDIRECT_PATH = encodeURIComponent("/calendar");

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${CALENDAR_REDIRECT_PATH}`);
  }

  const { familyRepository } = await createServerFamilyDependencies();
  const families = await familyRepository.findByUserId(user.id);
  const cookieStore = await cookies();
  const activeFamily = resolveActiveItem(
    families,
    cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value,
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] text-slate-900">
      <AppNavBar
        activeFamilyId={activeFamily?.id ?? null}
        families={families}
        userEmail={user.email}
      />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
