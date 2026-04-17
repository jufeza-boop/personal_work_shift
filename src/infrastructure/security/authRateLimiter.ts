import { RateLimiter } from "@/infrastructure/security/RateLimiter";

/**
 * Rate limiter for authentication endpoints.
 * Allows 10 attempts per IP per 15-minute window.
 */
export const authRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
});
