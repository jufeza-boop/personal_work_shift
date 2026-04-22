import { describe, expect, it } from "vitest";
import {
  resolveAuthRedirect,
  sanitizeRedirectPath,
} from "@/shared/auth/routeProtection";

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

  it("redirects authenticated users away from the public landing page", () => {
    expect(resolveAuthRedirect("/", true)).toBe("/calendar");
  });

  it("allows public routes for guests", () => {
    expect(resolveAuthRedirect("/", false)).toBeNull();
  });
});

describe("sanitizeRedirectPath", () => {
  it("keeps safe internal paths", () => {
    expect(sanitizeRedirectPath("/calendar")).toBe("/calendar");
    expect(sanitizeRedirectPath("/family/settings")).toBe("/family/settings");
  });

  it("falls back to the calendar route for unsafe or missing paths", () => {
    expect(sanitizeRedirectPath("//evil.example")).toBe("/calendar");
    expect(sanitizeRedirectPath("https://evil.example")).toBe("/calendar");
    expect(sanitizeRedirectPath(undefined)).toBe("/calendar");
    expect(sanitizeRedirectPath(null)).toBe("/calendar");
  });
});
