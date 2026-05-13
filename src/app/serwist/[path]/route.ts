import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

/**
 * Obtiene la revisión de forma segura.
 * 1. Intenta usar la variable de Vercel (ideal para producción).
 * 2. Si no existe, intenta ejecutar git (ideal para desarrollo local).
 * 3. Fallback a UUID.
 */
const getRevision = (): string => {
  // Prioridad 1: Vercel (Producción/Preview)
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }

  // Prioridad 2: Git local (Desarrollo) con PATH seguro
  try {
    const SECURE_PATH = "/usr/bin:/bin:/usr/sbin:/sbin";
    const gitProcess = spawnSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf-8",
      env: { ...process.env, PATH: SECURE_PATH },
      shell: false,
    });

    return gitProcess.stdout?.trim() || crypto.randomUUID();
  } catch {
    return crypto.randomUUID();
  }
};

const revision = getRevision();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });