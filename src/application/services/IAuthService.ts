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
export type RegisterAuthResult = AuthResult<
  RegisterAuthOutput,
  RegisterAuthErrorCode
>;

export interface LoginAuthInput {
  email: string;
  password: string;
}

export interface LoginAuthOutput {
  email: string;
  userId: string;
}

export type LoginAuthErrorCode = "AUTH_PROVIDER_ERROR" | "INVALID_CREDENTIALS";
export type LoginAuthResult = AuthResult<LoginAuthOutput, LoginAuthErrorCode>;

export type LogoutAuthErrorCode = "AUTH_PROVIDER_ERROR";
export type LogoutAuthResult = AuthResult<void, LogoutAuthErrorCode>;

export type DeleteAccountAuthErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "ADMIN_NOT_CONFIGURED";
export type DeleteAccountAuthResult = AuthResult<
  void,
  DeleteAccountAuthErrorCode
>;

export type ResetPasswordErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "RATE_LIMIT_EXCEEDED";
export type ResetPasswordResult = AuthResult<void, ResetPasswordErrorCode>;

export type VerifyOtpErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "INVALID_OTP"
  | "OTP_EXPIRED";
export type VerifyOtpResult = AuthResult<void, VerifyOtpErrorCode>;

export type UpdatePasswordErrorCode =
  | "AUTH_PROVIDER_ERROR"
  | "WEAK_PASSWORD"
  | "NO_SESSION";
export type UpdatePasswordResult = AuthResult<void, UpdatePasswordErrorCode>;

export interface IAuthService {
  register(input: RegisterAuthInput): Promise<RegisterAuthResult>;
  login(input: LoginAuthInput): Promise<LoginAuthResult>;
  logout(): Promise<LogoutAuthResult>;
  deleteAccount(userId: string): Promise<DeleteAccountAuthResult>;
  resetPasswordForEmail(email: string): Promise<ResetPasswordResult>;
  verifyOtp(email: string, token: string): Promise<VerifyOtpResult>;
  updatePassword(newPassword: string): Promise<UpdatePasswordResult>;
}
