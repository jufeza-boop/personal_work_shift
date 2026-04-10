export interface AuthError<TCode extends string> {
  code: TCode;
  message: string;
}

export type AuthResult<TData, TCode extends string> =
  | {
      data: TData;
      success: true;
    }
  | {
      error: AuthError<TCode>;
      success: false;
    };

export interface RegisterAuthInput {
  displayName: string;
  email: string;
  password: string;
}

export interface RegisterAuthOutput {
  email: string;
  requiresEmailVerification: boolean;
  userId: string;
}

export type RegisterAuthErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "EMAIL_ALREADY_REGISTERED";

export interface LoginAuthInput {
  email: string;
  password: string;
}

export interface LoginAuthOutput {
  email: string;
  userId: string;
}

export type LoginAuthErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "INVALID_CREDENTIALS";

export type LogoutAuthErrorCode = "AUTH_PROVIDER_ERROR";

export interface IAuthService {
  register(
    input: RegisterAuthInput,
  ): Promise<AuthResult<RegisterAuthOutput, RegisterAuthErrorCode>>;
  login(
    input: LoginAuthInput,
  ): Promise<AuthResult<LoginAuthOutput, LoginAuthErrorCode>>;
  logout(): Promise<AuthResult<void, LogoutAuthErrorCode>>;
}
