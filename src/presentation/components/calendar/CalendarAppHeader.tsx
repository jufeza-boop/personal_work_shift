import Link from "next/link";
import { CalendarDays, Plus, Settings2 } from "lucide-react";
import { deleteAccountAction, logoutAction } from "@/app/actions/auth";
import { switchFamilyAction } from "@/app/actions/family";
import type { Family } from "@/domain/entities/Family";
import { FamilySelectorDropdown } from "@/presentation/components/family/FamilySelectorDropdown";
import { NotificationBell } from "@/presentation/components/ui/NotificationBell";
import { UserMenu } from "@/presentation/components/ui/UserMenu";

interface CalendarAppHeaderProps {
  activeFamilyId: string | null;
  activeFamilyName: string | null;
  families: Family[];
  userEmail: string;
}

export function CalendarAppHeader({
  activeFamilyId,
  activeFamilyName,
  families,
  userEmail,
}: CalendarAppHeaderProps) {
  const serializedFamilies = families.map(({ id, name }) => ({ id, name }));
  const hasManyFamilies = serializedFamilies.length >= 2;

  return (
    <header className="sticky top-0 z-40 flex h-13 items-center justify-between gap-2 border-b border-stone-200/80 bg-white/90 px-3 backdrop-blur sm:h-14 sm:px-4">
      {/* Brand + family name */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          className="flex shrink-0 items-center gap-1.5 text-amber-900 hover:opacity-80"
          href="/calendar"
          aria-label="Ir al calendario"
        >
          <CalendarDays className="h-5 w-5" />
        </Link>

        {hasManyFamilies ? (
          <FamilySelectorDropdown
            action={switchFamilyAction}
            activeFamilyId={activeFamilyId}
            families={serializedFamilies}
          />
        ) : (
          <span className="truncate text-sm font-semibold text-amber-900">
            {activeFamilyName ?? "Personal Work Shift"}
          </span>
        )}
      </div>

      {/* Actions */}
      <nav
        aria-label="Acciones del calendario"
        className="flex shrink-0 items-center gap-0.5"
      >
        <Link
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
          href="/calendar/settings"
          aria-label="Ajustes de familia"
          title="Ajustes de familia"
        >
          <Settings2 className="h-4 w-4" />
        </Link>

        <NotificationBell />

        <Link
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-stone-100 hover:text-slate-900"
          href="/calendar/family/new"
          aria-label="Nueva familia"
          title="Nueva familia"
        >
          <Plus className="h-4 w-4" />
        </Link>

        <UserMenu
          email={userEmail}
          logoutAction={logoutAction}
          deleteAccountAction={deleteAccountAction}
        />
      </nav>
    </header>
  );
}
