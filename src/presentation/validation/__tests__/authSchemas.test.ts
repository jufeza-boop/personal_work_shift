import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
} from "@/presentation/validation/authSchemas";

describe("authSchemas", () => {
  it("normalizes registration input", () => {
    const result = registerSchema.safeParse({
      displayName: " Alice Example ",
      email: " ALICE@example.com ",
      password: "Password1",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "password",
    });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.password).toEqual([
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
    ]);
  });

  it("normalizes login input", () => {
    const result = loginSchema.safeParse({
      email: " ALICE@example.com ",
      password: "Password1",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: "alice@example.com",
      password: "Password1",
    });
  });
});
