import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";

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

  return <>{children}</>;
}
