import { describe, expect, it } from "vitest";
import { getAppEnv } from "@/shared/config/env";

describe("getAppEnv", () => {
  it("returns the validated public Supabase configuration", () => {
    const env = getAppEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-public-key",
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("test-anon-key");
    expect(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY).toBe("test-vapid-public-key");
  });

  it("throws when a required public variable is missing", () => {
    expect(() =>
      getAppEnv({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      }),
    ).toThrow("Invalid environment variables");
  });
});
