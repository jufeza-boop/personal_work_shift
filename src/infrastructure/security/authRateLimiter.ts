import { RateLimiter } from "@/infrastructure/security/RateLimiter";

/**
 * Rate limiter for authentication endpoints.
 * Allows 10 attempts per IP per 15-minute window.
 * Stale entries are cleaned up automatically every 30 minutes.
 */
export const authRateLimiter = new RateLimiter({
  cleanupIntervalMs: 30 * 60 * 1000,
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
});
