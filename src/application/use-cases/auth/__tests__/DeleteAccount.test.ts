import { describe, expect, it, vi } from "vitest";
import type { IAuthService } from "@/application/services/IAuthService";
import { DeleteAccount } from "@/application/use-cases/auth/DeleteAccount";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createUserRepository(): IUserRepository {
  return {
    delete: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findDelegatedUsers: vi.fn(),
    save: vi.fn(),
  };
}

function createAuthService(): IAuthService {
  return {
    deleteAccount: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };
}

const EXISTING_USER = new User({
  displayName: "Alice Example",
  email: "alice@example.com",
  id: "user-1",
});

describe("DeleteAccount", () => {
  it("deletes the auth account and user profile when the user exists", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);
    vi.mocked(authService.deleteAccount).mockResolvedValue({
      data: undefined,
      success: true,
    });

    const useCase = new DeleteAccount(authService, userRepository);
    const result = await useCase.execute({ userId: "user-1" });

    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(authService.deleteAccount).toHaveBeenCalledWith("user-1");
    expect(userRepository.delete).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ data: undefined, success: true });
  });

  it("returns USER_NOT_FOUND when the user does not exist", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new DeleteAccount(authService, userRepository);
    const result = await useCase.execute({ userId: "unknown-id" });

    expect(authService.deleteAccount).not.toHaveBeenCalled();
    expect(userRepository.delete).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: { code: "USER_NOT_FOUND", message: "User not found" },
      success: false,
    });
  });

  it("returns ADMIN_NOT_CONFIGURED when the admin client is not available", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);
    vi.mocked(authService.deleteAccount).mockResolvedValue({
      error: {
        code: "ADMIN_NOT_CONFIGURED",
        message: "Admin client is not configured",
      },
      success: false,
    });

    const useCase = new DeleteAccount(authService, userRepository);
    const result = await useCase.execute({ userId: "user-1" });

    expect(userRepository.delete).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "ADMIN_NOT_CONFIGURED",
        message: "Admin client is not configured",
      },
      success: false,
    });
  });

  it("returns AUTH_PROVIDER_ERROR when the auth provider fails to delete the account", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);
    vi.mocked(authService.deleteAccount).mockResolvedValue({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Account deletion failed",
      },
      success: false,
    });

    const useCase = new DeleteAccount(authService, userRepository);
    const result = await useCase.execute({ userId: "user-1" });

    expect(userRepository.delete).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Account deletion failed",
      },
      success: false,
    });
  });

  it("does not delete the user profile when auth deletion fails", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);
    vi.mocked(authService.deleteAccount).mockResolvedValue({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Account deletion failed",
      },
      success: false,
    });

    const useCase = new DeleteAccount(authService, userRepository);
    await useCase.execute({ userId: "user-1" });

    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
