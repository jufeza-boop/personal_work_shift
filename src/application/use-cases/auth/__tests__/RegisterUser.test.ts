import { describe, expect, it, vi } from "vitest";
import type { IAuthService } from "@/application/services/IAuthService";
import { RegisterUser } from "@/application/use-cases/auth/RegisterUser";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createUserRepository(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
  };
}

function createAuthService(): IAuthService {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };
}

describe("RegisterUser", () => {
  it("registers a new user with normalized input", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(authService.register).mockResolvedValue({
      data: {
        email: "alice@example.com",
        requiresEmailVerification: true,
        userId: "auth-user-1",
      },
      success: true,
    });

    const useCase = new RegisterUser(userRepository, authService);
    const result = await useCase.execute({
      displayName: " Alice Example ",
      email: " ALICE@example.com ",
      password: "Password1",
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith("alice@example.com");
    expect(authService.register).toHaveBeenCalledWith({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });
    expect(result).toEqual({
      data: {
        email: "alice@example.com",
        requiresEmailVerification: true,
        userId: "auth-user-1",
      },
      success: true,
    });
  });

  it("rejects a duplicate email before calling the auth service", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      new User({
        displayName: "Alice Example",
        email: "alice@example.com",
        id: "user-1",
      }),
    );

    const useCase = new RegisterUser(userRepository, authService);
    const result = await useCase.execute({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "EMAIL_ALREADY_REGISTERED",
        message: "Email is already registered",
      },
      success: false,
    });
  });

  it("rejects a weak password", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const useCase = new RegisterUser(userRepository, authService);
    const result = await useCase.execute({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "password",
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "WEAK_PASSWORD",
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, and numeric characters",
      },
      success: false,
    });
  });

  it("returns the adapter failure when registration cannot be completed", async () => {
    const userRepository = createUserRepository();
    const authService = createAuthService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(authService.register).mockResolvedValue({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Registration failed",
      },
      success: false,
    });

    const useCase = new RegisterUser(userRepository, authService);
    const result = await useCase.execute({
      displayName: "Alice Example",
      email: "alice@example.com",
      password: "Password1",
    });

    expect(result).toEqual({
      error: {
        code: "AUTH_PROVIDER_ERROR",
        message: "Registration failed",
      },
      success: false,
    });
  });
});
