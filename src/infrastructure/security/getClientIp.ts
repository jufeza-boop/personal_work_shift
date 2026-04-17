import { headers } from "next/headers";

/**
 * Extracts the client IP address from Next.js request headers.
 * Falls back to "unknown" if no IP is found.
 *
 * Note: x-forwarded-for can be spoofed by clients. In production behind a
 * reverse proxy (e.g. Vercel), the proxy overwrites this header with the
 * actual client IP, making it trustworthy in that deployment context.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}
