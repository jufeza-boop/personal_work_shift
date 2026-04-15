"use client";

import { useRef } from "react";
import { Family } from "@/domain/entities/Family";

interface FamilySelectorDropdownProps {
  action: (formData: FormData) => Promise<void>;
  activeFamilyId: string | null;
  families: Family[];
  redirectTo?: string;
}

export function FamilySelectorDropdown({
  action,
  activeFamilyId,
  families,
  redirectTo = "/calendar",
}: FamilySelectorDropdownProps) {
  const formRef = useRef<HTMLFormElement>(null);

  if (families.length < 2) {
    return null;
  }

  return (
    <form action={action} ref={formRef}>
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <label className="sr-only" htmlFor="family-selector-dropdown">
        Familia
      </label>
      <select
        className="rounded-lg border border-stone-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        defaultValue={activeFamilyId ?? ""}
        id="family-selector-dropdown"
        name="familyId"
        onChange={() => {
          const form = formRef.current as unknown as {
            requestSubmit?: () => void;
          };
          form?.requestSubmit?.();
        }}
      >
        {families.map((family) => (
          <option key={family.id} value={family.id}>
            {family.name}
          </option>
        ))}
      </select>
    </form>
  );
}
