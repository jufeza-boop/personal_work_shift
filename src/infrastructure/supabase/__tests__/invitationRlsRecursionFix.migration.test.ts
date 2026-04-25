import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/20260425203000_fix_family_invitations_rls_recursion.sql",
);

describe("Invitation RLS recursion fix migration", () => {
  const migration = readFileSync(MIGRATION_PATH, "utf8");

  it("replaces owner policies with non-recursive helper checks", () => {
    expect(migration).toContain(
      "drop policy if exists family_invitations_insert_owner",
    );
    expect(migration).toContain(
      "create policy family_invitations_insert_owner",
    );
    expect(migration).toContain(
      "and (select public.is_family_owner(family_id))",
    );

    expect(migration).toContain(
      "drop policy if exists family_invitations_select_owner",
    );
    expect(migration).toContain(
      "create policy family_invitations_select_owner",
    );
    expect(migration).toContain(
      "using ((select public.is_family_owner(family_id)))",
    );

    expect(migration).toContain(
      "drop policy if exists family_invitations_update_owner",
    );
    expect(migration).toContain(
      "with check ((select public.is_family_owner(family_id)))",
    );
    expect(migration).toContain(
      "drop policy if exists family_invitations_delete_owner",
    );
    expect(migration).not.toContain(
      "where id = family_invitations.family_id and created_by = auth.uid()",
    );
  });
});
