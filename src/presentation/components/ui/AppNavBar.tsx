import Link from "next/link";
import { CalendarDays, Plus, Settings2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { switchFamilyAction } from "@/app/actions/family";
import type { Family } from "@/domain/entities/Family";
import { FamilySelectorDropdown } from "@/presentation/components/family/FamilySelectorDropdown";
import { UserMenu } from "@/presentation/components/ui/UserMenu";

const NAV_LINKS = [
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
  { href: "/calendar/settings", icon: Settings2, label: "Ajustes de familia" },
] as const;

interface AppNavBarProps {
  activeFamilyId: string | null;
  families: Family[];
  userEmail: string;
}

export function AppNavBar({
  activeFamilyId,
  families,
  userEmail,
}: AppNavBarProps) {
  const serializedFamilies = families.map(({ id, name }) => ({ id, name }));

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6 sm:px-10">
        {/* Brand */}
        <Link
          className="flex items-center gap-2 font-semibold text-amber-900 hover:opacity-80"
          href="/calendar"
        >
          <CalendarDays className="h-5 w-5" />
          <span className="hidden sm:inline">Personal Work Shift</span>
        </Link>

        {/* Nav links + family selector */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1"
        >
          {NAV_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-stone-100 hover:text-slate-900"
              href={href}
              key={href}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
          <FamilySelectorDropdown
            action={switchFamilyAction}
            activeFamilyId={activeFamilyId}
            families={serializedFamilies}
          />
          <Link
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-stone-100 hover:text-slate-900"
            href="/calendar/family/new"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva familia</span>
          </Link>
        </nav>

        {/* User menu */}
        <UserMenu email={userEmail} logoutAction={logoutAction} />
      </div>
    </header>
  );
}
