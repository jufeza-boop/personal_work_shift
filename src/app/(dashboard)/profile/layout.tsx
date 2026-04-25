import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerFamilyDependencies } from "@/infrastructure/family/runtime";
import {
  ACTIVE_FAMILY_COOKIE,
  resolveActiveItem,
} from "@/shared/family/activeFamily";
import { CalendarAppHeader } from "@/presentation/components/calendar/CalendarAppHeader";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/profile")}`);
  }

  const { familyRepository } = await createServerFamilyDependencies();
  const families = await familyRepository.findByUserId(user.id);
  const cookieStore = await cookies();
  const activeFamily = resolveActiveItem(
    families,
    cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] text-slate-900">
      <CalendarAppHeader
        activeFamilyId={activeFamily?.id ?? null}
        activeFamilyName={activeFamily?.name ?? null}
        families={families}
        userEmail={user.email}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
