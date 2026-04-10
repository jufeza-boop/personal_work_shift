import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { Button } from "@/presentation/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=%2Fcalendar");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] px-6 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Sesión iniciada como</p>
            <h1 className="text-2xl font-semibold">{user.email}</h1>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="secondary">
              Cerrar sesión
            </Button>
          </form>
        </header>

        {children}
      </div>
    </main>
  );
}
