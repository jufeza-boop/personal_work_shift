import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { IAuthService } from "@/application/services/IAuthService";
import {
  createMockUser,
  deleteMockUser,
  findMockUserByEmail,
  findMockUserById,
  MOCK_SESSION_COOKIE,
} from "@/infrastructure/auth/mockAuthStore";

interface CookieWriter {
  delete(name: string): void;
  set(name: string, value: string, options?: Partial<ResponseCookie>): void;
}

const SESSION_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: false,
};

export class MockAuthAdapter implements IAuthService {
  constructor(private readonly cookieStore: CookieWriter) {}

  async register(input: {
    displayName: string;
    email: string;
    password: string;
  }) {
    const existingUser = findMockUserByEmail(input.email);

    if (existingUser) {
      return {
        error: {
          code: "EMAIL_ALREADY_REGISTERED" as const,
          message: "Email is already registered",
        },
        success: false as const,
      };
    }

    const user = createMockUser(input);

    return {
      data: {
        email: user.email,
        requiresEmailVerification: true,
        userId: user.id,
      },
      success: true as const,
    };
  }

  async login(input: { email: string; password: string }) {
    const user = findMockUserByEmail(input.email);

    if (!user || user.password !== input.password) {
      return {
        error: {
          code: "INVALID_CREDENTIALS" as const,
          message: "Invalid email or password",
        },
        success: false as const,
      };
    }

    this.cookieStore.set(MOCK_SESSION_COOKIE, user.id, SESSION_COOKIE_OPTIONS);

    return {
      data: {
        email: user.email,
        userId: user.id,
      },
      success: true as const,
    };
  }

  async logout() {
    this.cookieStore.delete(MOCK_SESSION_COOKIE);

    return {
      data: undefined,
      success: true as const,
    };
  }

  async deleteAccount(userId: string) {
    const user = findMockUserById(userId);

    if (!user) {
      return {
        error: {
          code: "AUTH_PROVIDER_ERROR" as const,
          message: "User not found",
        },
        success: false as const,
      };
    }

    deleteMockUser(userId);
    this.cookieStore.delete(MOCK_SESSION_COOKIE);

    return {
      data: undefined,
      success: true as const,
    };
  }
}
