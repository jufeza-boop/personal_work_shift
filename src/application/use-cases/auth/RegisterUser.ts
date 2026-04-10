import type {
  AuthResult,
  IAuthService,
  RegisterAuthErrorCode,
  RegisterAuthOutput,
} from "@/application/services/IAuthService";
import {
  isStrongPassword,
  isValidEmail,
  normalizeDisplayName,
  normalizeEmail,
} from "@/application/use-cases/auth/authUtils";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

export interface RegisterUserInput {
  displayName: string;
  email: string;
  password: string;
}

export type RegisterUserErrorCode =
  | RegisterAuthErrorCode
  | "INVALID_EMAIL"
  | "INVALID_DISPLAY_NAME"
  | "WEAK_PASSWORD";

export type RegisterUserResult = AuthResult<
  RegisterAuthOutput,
  RegisterUserErrorCode
>;

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    const email = normalizeEmail(input.email);
    const displayName = normalizeDisplayName(input.displayName);

    if (!isValidEmail(email)) {
      return {
        error: {
          code: "INVALID_EMAIL",
          message: "Email must be a valid email address",
        },
        success: false,
      };
    }

    if (displayName.length === 0) {
      return {
        error: {
          code: "INVALID_DISPLAY_NAME",
          message: "Display name cannot be empty",
        },
        success: false,
      };
    }

    if (!isStrongPassword(input.password)) {
      return {
        error: {
          code: "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, and numeric characters",
        },
        success: false,
      };
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      return {
        error: {
          code: "EMAIL_ALREADY_REGISTERED",
          message: "Email is already registered",
        },
        success: false,
      };
    }

    return this.authService.register({
      displayName,
      email,
      password: input.password,
    });
  }
}
