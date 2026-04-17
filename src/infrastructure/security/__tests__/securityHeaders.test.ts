import { securityHeaders } from "@/infrastructure/security/securityHeaders";

describe("securityHeaders", () => {
  function findHeader(key: string): string | undefined {
    return securityHeaders.find((h) => h.key === key)?.value;
  }

  it("includes X-Frame-Options set to DENY", () => {
    expect(findHeader("X-Frame-Options")).toBe("DENY");
  });

  it("includes X-Content-Type-Options set to nosniff", () => {
    expect(findHeader("X-Content-Type-Options")).toBe("nosniff");
  });

  it("includes Referrer-Policy", () => {
    expect(findHeader("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("includes Permissions-Policy restricting camera, microphone and geolocation", () => {
    expect(findHeader("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
  });

  it("includes Strict-Transport-Security with at least 1 year max-age", () => {
    const hsts = findHeader("Strict-Transport-Security");
    expect(hsts).toBeDefined();
    expect(hsts).toContain("max-age=");

    const match = hsts!.match(/max-age=(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(31536000);
    expect(hsts).toContain("includeSubDomains");
  });

  it("includes Content-Security-Policy", () => {
    const csp = findHeader("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
  });

  it("includes X-DNS-Prefetch-Control", () => {
    expect(findHeader("X-DNS-Prefetch-Control")).toBe("on");
  });
});
