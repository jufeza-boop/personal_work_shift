import type {
  AuthResult,
  IAuthService,
  LoginAuthErrorCode,
  LoginAuthOutput,
} from "@/application/services/IAuthService";
import {
  isValidEmail,
  normalizeEmail,
} from "@/application/use-cases/auth/authUtils";

export interface LoginUserInput {
  email: string;
  password: string;
}

export type LoginUserResult = AuthResult<LoginAuthOutput, LoginAuthErrorCode>;

export class LoginUser {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const email = normalizeEmail(input.email);

    if (!isValidEmail(email)) {
      return {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
        success: false,
      };
    }

    return this.authService.login({
      email,
      password: input.password,
    });
  }
}
