import { authRateLimiter } from "@/infrastructure/security/authRateLimiter";

describe("authRateLimiter", () => {
  it("exports a configured rate limiter for auth endpoints", () => {
    expect(authRateLimiter).toBeDefined();
    expect(typeof authRateLimiter.check).toBe("function");
  });

  it("allows initial auth attempts", () => {
    const result = authRateLimiter.check("test-ip-unique");
    expect(result.allowed).toBe(true);
  });
});
