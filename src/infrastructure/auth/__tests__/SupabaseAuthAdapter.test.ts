import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseAuthAdapter } from "@/infrastructure/auth/SupabaseAuthAdapter";
import type { Database } from "@/infrastructure/supabase/database.types";

describe("SupabaseAuthAdapter", () => {
  it("registers a user through Supabase Auth", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: {
        user: {
          email: "alice@example.com",
          id: "user-1",
        },
      },
      error: null,
    });
    const client = {
      auth: {
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        signUp,
      },
    } as unknown as SupabaseClient<Database>;

    const adapter = new SupabaseAuthAdapter(client);
    const result = await adapter.register({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });

    expect(signUp).toHaveBeenCalledWith({
      email: "alice@example.com",
      options: {
        data: {
          display_name: "Alice Example",
        },
      },
      password: "Password1",
    });
    expect(result).toEqual({
      data: {
        email: "alice@example.com",
        requiresEmailVerification: true,
        userId: "user-1",
      },
      success: true,
    });
  });

  it("maps invalid credentials to a generic login failure", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        message: "Invalid login credentials",
        status: 400,
      },
    });
    const client = {
      auth: {
        signInWithPassword,
        signOut: vi.fn(),
        signUp: vi.fn(),
      },
    } as unknown as SupabaseClient<Database>;

    const adapter = new SupabaseAuthAdapter(client);
    const result = await adapter.login({
      email: "alice@example.com",
      password: "Password1",
    });

    expect(result).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
      success: false,
    });
  });

  it("logs the current user in through Supabase Auth", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: {
        user: {
          email: "alice@example.com",
          id: "user-1",
        },
      },
      error: null,
    });
    const client = {
      auth: {
        signInWithPassword,
        signOut: vi.fn(),
        signUp: vi.fn(),
      },
    } as unknown as SupabaseClient<Database>;

    const adapter = new SupabaseAuthAdapter(client);
    const result = await adapter.login({
      email: "alice@example.com",
      password: "Password1",
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "Password1",
    });
    expect(result).toEqual({
      data: {
        email: "alice@example.com",
        userId: "user-1",
      },
      success: true,
    });
  });

  it("logs the current user out through Supabase Auth", async () => {
    const signOut = vi.fn().mockResolvedValue({
      error: null,
    });
    const client = {
      auth: {
        signInWithPassword: vi.fn(),
        signOut,
        signUp: vi.fn(),
      },
    } as unknown as SupabaseClient<Database>;

    const adapter = new SupabaseAuthAdapter(client);
    const result = await adapter.logout();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: undefined,
      success: true,
    });
  });
});
