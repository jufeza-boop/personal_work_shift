import { headers } from "next/headers";

/**
 * Extracts the client IP address from Next.js request headers.
 * Falls back to "unknown" if no IP is found.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}
