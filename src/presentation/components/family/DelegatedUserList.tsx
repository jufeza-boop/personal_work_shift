import type { User } from "@/domain/entities/User";

interface DelegatedUserListProps {
  delegatedUsers: User[];
  removeAction: (formData: FormData) => Promise<void>;
  redirectTo?: string;
}

export function DelegatedUserList({
  delegatedUsers,
  removeAction,
  redirectTo = "/calendar/settings",
}: DelegatedUserListProps) {
  if (delegatedUsers.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Usuarios delegados
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Estos usuarios son gestionados por ti. Puedes crear y eliminar sus
        eventos en su nombre.
      </p>

      <ul className="mt-4 space-y-3">
        {delegatedUsers.map((delegatedUser) => (
          <li
            className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-3"
            key={delegatedUser.id}
          >
            <span className="font-medium text-slate-900">
              {delegatedUser.displayName}
            </span>

            <form action={removeAction}>
              <input
                name="delegatedUserId"
                type="hidden"
                value={delegatedUser.id}
              />
              <input name="redirectTo" type="hidden" value={redirectTo} />
              <button
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                type="submit"
              >
                Eliminar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
