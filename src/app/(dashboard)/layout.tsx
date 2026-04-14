import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] text-slate-900">
      <AppNavBar userEmail={user.email} />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8 sm:px-10">
        {children}
      </main>
    </div>
  );
}
