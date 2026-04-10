import { describe, expect, it } from "vitest";
import { resolveAuthRedirect } from "@/shared/auth/routeProtection";

describe("resolveAuthRedirect", () => {
  it("redirects guests away from protected routes", () => {
    expect(resolveAuthRedirect("/calendar", false)).toBe(
      "/login?redirectTo=%2Fcalendar",
    );
  });

  it("redirects authenticated users away from auth routes", () => {
    expect(resolveAuthRedirect("/login", true)).toBe("/calendar");
    expect(resolveAuthRedirect("/register", true)).toBe("/calendar");
  });

  it("allows public routes for guests", () => {
    expect(resolveAuthRedirect("/", false)).toBeNull();
  });
});
