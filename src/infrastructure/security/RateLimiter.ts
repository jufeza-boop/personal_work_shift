interface RateLimiterOptions {
  cleanupIntervalMs?: number;
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export class RateLimiter {
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly entries = new Map<string, RateLimitEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: RateLimiterOptions) {
    this.maxAttempts = options.maxAttempts;
    this.windowMs = options.windowMs;

    if (options.cleanupIntervalMs) {
      this.cleanupTimer = setInterval(
        () => this.cleanup(),
        options.cleanupIntervalMs,
      );

      // Allow the Node.js process to exit even if the timer is still running
      if (typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
        this.cleanupTimer.unref();
      }
    }
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.entries.get(key);

    if (!entry || now >= entry.resetAt) {
      this.entries.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });

      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
      };
    }

    if (entry.count >= this.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: entry.resetAt - now,
      };
    }

    entry.count += 1;

    return {
      allowed: true,
      remaining: this.maxAttempts - entry.count,
    };
  }

  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.entries) {
      if (now >= entry.resetAt) {
        this.entries.delete(key);
      }
    }
  }
}
