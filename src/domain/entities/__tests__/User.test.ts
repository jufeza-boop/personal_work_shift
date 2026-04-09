import { describe, expect, it } from "vitest";
import { User } from "@/domain/entities/User";

describe("User", () => {
  it("normalizes the email and trims the display name", () => {
    const user = new User({
      id: "user-1",
      email: " TEST@Example.COM ",
      displayName: "  Jane Doe  ",
    });

    expect(user.email).toBe("test@example.com");
    expect(user.displayName).toBe("Jane Doe");
    expect(user.isDelegated()).toBe(false);
  });

  it("marks delegated users", () => {
    const user = new User({
      id: "user-2",
      email: "child@example.com",
      displayName: "Child",
      delegatedByUserId: "parent-1",
    });

    expect(user.isDelegated()).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(
      () =>
        new User({
          id: "user-3",
          email: "not-an-email",
          displayName: "Jane Doe",
        }),
    ).toThrow("User email must be a valid email address");
  });
});
