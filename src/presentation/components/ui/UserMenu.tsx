"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, User, Users } from "lucide-react";

interface UserMenuProps {
  email: string;
  logoutAction: () => Promise<void>;
}

export function UserMenu({ email, logoutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const initial = email.charAt(0).toUpperCase();

  return (
    <details
      data-testid="user-menu"
      open={open}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      className="group relative"
    >
      <summary
        aria-label="Menú de usuario"
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {initial}
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-stone-200 bg-white shadow-lg">
        <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
          <User className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="truncate text-sm text-slate-700">{email}</p>
        </div>
        <div className="p-1">
          <Link
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 hover:text-slate-900"
            href="/calendar/delegated-users"
            onClick={() => setOpen(false)}
          >
            <Users className="h-4 w-4 text-slate-400" />
            Usuarios delegados
          </Link>
          <form action={logoutAction}>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 hover:text-slate-900"
              type="submit"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
