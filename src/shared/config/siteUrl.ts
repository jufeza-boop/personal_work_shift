/**
 * Returns the public site URL for use in generating absolute links
 * (e.g. shareable invitation URLs).
 *
 * Reads `NEXT_PUBLIC_SITE_URL` from the environment and falls back to
 * localhost:3000 for local development.  Set the env var in Vercel for
 * production deployments.
 */
export function getSiteUrl(): string {
  return process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";
}
