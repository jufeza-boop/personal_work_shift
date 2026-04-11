import { Family } from "@/domain/entities/Family";
import { Button } from "@/presentation/components/ui/button";

interface FamilySelectorPanelProps {
  action: (formData: FormData) => Promise<void>;
  activeFamilyId: string | null;
  families: Family[];
  redirectTo?: string;
}

export function FamilySelectorPanel({
  action,
  activeFamilyId,
  families,
  redirectTo = "/calendar",
}: FamilySelectorPanelProps) {
  if (families.length < 2) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Familias</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Cambia de contexto para revisar otro calendario compartido.
      </p>

      <div className="mt-4 space-y-3">
        {families.map((family) => {
          const isActive = family.id === activeFamilyId;
          const label = isActive ? `${family.name} (actual)` : family.name;

          return (
            <form action={action} className="w-full" key={family.id}>
              <input name="familyId" type="hidden" value={family.id} />
              <input name="redirectTo" type="hidden" value={redirectTo} />
              <Button
                aria-label={label}
                className="w-full justify-start"
                type="submit"
                variant={isActive ? "default" : "secondary"}
              >
                {label}
              </Button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
