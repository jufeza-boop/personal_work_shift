import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Resets transient state that would otherwise leak between test runs:
 *   - Mock auth store (file-based in-process store used when AUTH_DRIVER=mock)
 *
 * This ensures every `npx playwright test` run starts from a clean slate,
 * satisfying the "data isolation" requirement for E2E tests.
 */
export default function globalSetup(): void {
  const storePath = join(
    tmpdir(),
    "personal-work-shift",
    "mock-auth-store.json",
  );

  if (existsSync(storePath)) {
    rmSync(storePath);
  }
}
