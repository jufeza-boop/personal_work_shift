import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createDelegatedUserAction,
  removeDelegatedUserAction,
  renameDelegatedUserAction,
} from "@/app/actions/family";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerFamilyDependencies } from "@/infrastructure/family/runtime";
import { CreateDelegatedUserForm } from "@/presentation/components/family/CreateDelegatedUserForm";
import { DelegatedUserCard } from "@/presentation/components/family/DelegatedUserCard";

export default async function DelegatedUsersPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=%2Fcalendar%2Fdelegated-users");
  }

  const { userRepository } = await createServerFamilyDependencies();
  const delegatedUsers = await userRepository.findDelegatedUsers(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white/80 p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Usuarios delegados
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Gestiona los usuarios que dependen de ti. Puedes crear, editar y
                eliminar sus eventos en su nombre.
              </p>
            </div>
            <Link
              className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-stone-100 hover:text-slate-900"
              href="/calendar"
            >
              ← Calendario
            </Link>
          </div>
        </div>

        {delegatedUsers.length > 0 ? (
          <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Tus usuarios delegados
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {delegatedUsers.length === 1
                ? "Tienes 1 usuario delegado."
                : `Tienes ${delegatedUsers.length} usuarios delegados.`}
            </p>

            <ul className="mt-4 space-y-3">
              {delegatedUsers.map((delegatedUser) => (
                <DelegatedUserCard
                  delegatedUserId={delegatedUser.id}
                  displayName={delegatedUser.displayName}
                  key={delegatedUser.id}
                  removeAction={removeDelegatedUserAction}
                  renameAction={renameDelegatedUserAction}
                />
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              No tienes usuarios delegados todavía.
            </p>
          </section>
        )}

        <CreateDelegatedUserForm action={createDelegatedUserAction} />
      </section>
    </div>
  );
}
