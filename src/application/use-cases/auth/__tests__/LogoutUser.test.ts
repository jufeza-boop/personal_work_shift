import { describe, expect, it, vi } from "vitest";
import type { IAuthService } from "@/application/services/IAuthService";
import { LogoutUser } from "@/application/use-cases/auth/LogoutUser";

function createAuthService(): IAuthService {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };
}

describe("LogoutUser", () => {
  it("logs the current user out", async () => {
    const authService = createAuthService();

    vi.mocked(authService.logout).mockResolvedValue({
      data: undefined,
      success: true,
    });

    const useCase = new LogoutUser(authService);
    const result = await useCase.execute();

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: undefined,
      success: true,
    });
  });

  it("returns the adapter failure when logout fails", async () => {
    const authService = createAuthService();

    vi.mocked(authService.logout).mockResolvedValue({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Logout failed",
      },
      success: false,
    });

    const useCase = new LogoutUser(authService);
    const result = await useCase.execute();

    expect(result).toEqual({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Logout failed",
      },
      success: false,
    });
  });
});
