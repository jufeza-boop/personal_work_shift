import { describe, expect, it, vi } from "vitest";
import type { IAuthService } from "@/application/services/IAuthService";
import { LoginUser } from "@/application/use-cases/auth/LoginUser";

function createAuthService(): IAuthService {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };
}

describe("LoginUser", () => {
  it("logs a user in with normalized credentials", async () => {
    const authService = createAuthService();

    vi.mocked(authService.login).mockResolvedValue({
      data: {
        email: "alice@example.com",
        userId: "user-1",
      },
      success: true,
    });

    const useCase = new LoginUser(authService);
    const result = await useCase.execute({
      email: " ALICE@example.com ",
      password: "Password1",
    });

    expect(authService.login).toHaveBeenCalledWith({
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

  it("returns a generic error for invalid credentials", async () => {
    const authService = createAuthService();

    vi.mocked(authService.login).mockResolvedValue({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
      success: false,
    });

    const useCase = new LoginUser(authService);
    const result = await useCase.execute({
      email: "alice@example.com",
      password: "wrong-password",
    });

    expect(result).toEqual({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
      success: false,
    });
  });
});
