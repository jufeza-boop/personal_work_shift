import { RateLimiter } from "@/infrastructure/security/RateLimiter";

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter({ maxAttempts: 5, windowMs: 60_000 });

    for (let i = 0; i < 5; i++) {
      expect(limiter.check("192.168.1.1")).toEqual({
        allowed: true,
        remaining: 5 - i - 1,
      });
    }
  });

  it("blocks requests that exceed the limit", () => {
    const limiter = new RateLimiter({ maxAttempts: 3, windowMs: 60_000 });

    for (let i = 0; i < 3; i++) {
      limiter.check("10.0.0.1");
    }

    const result = limiter.check("10.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const limiter = new RateLimiter({ maxAttempts: 2, windowMs: 60_000 });

    limiter.check("user-a");
    limiter.check("user-a");

    expect(limiter.check("user-a").allowed).toBe(false);
    expect(limiter.check("user-b").allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 100 });

    limiter.check("key-1");
    expect(limiter.check("key-1").allowed).toBe(false);

    vi.advanceTimersByTime(150);
    expect(limiter.check("key-1").allowed).toBe(true);
  });

  it("cleans up stale entries to prevent memory leaks", () => {
    const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 100 });

    limiter.check("stale-key");
    vi.advanceTimersByTime(150);

    limiter.cleanup();
    // After cleanup, the stale key should be gone and a new request allowed
    expect(limiter.check("stale-key").allowed).toBe(true);
  });

  it("runs automatic cleanup when cleanupIntervalMs is set", () => {
    const limiter = new RateLimiter({
      cleanupIntervalMs: 200,
      maxAttempts: 1,
      windowMs: 100,
    });

    limiter.check("auto-key");
    expect(limiter.check("auto-key").allowed).toBe(false);

    // Advance past window + cleanup interval
    vi.advanceTimersByTime(250);

    // After automatic cleanup, the key should be gone
    expect(limiter.check("auto-key").allowed).toBe(true);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
