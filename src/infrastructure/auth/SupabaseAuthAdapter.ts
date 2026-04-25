import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DeleteAccountAuthResult,
  IAuthService,
  LoginAuthInput,
  LoginAuthResult,
  LogoutAuthResult,
  RegisterAuthInput,
  RegisterAuthResult,
  ResetPasswordResult,
  UpdatePasswordResult,
  VerifyOtpResult,
} from "@/application/services/IAuthService";
import type { Database } from "@/infrastructure/supabase/database.types";

function toRegisterFailure(message: string): RegisterAuthResult {
  return {
    error: {
      code: "AUTH_PROVIDER_ERROR",
      message,
    },
    success: false,
  };
}

function toLoginFailure(message: string): LoginAuthResult {
  return {
    error: {
      code: "AUTH_PROVIDER_ERROR",
      message,
    },
    success: false,
  };
}

export class SupabaseAuthAdapter implements IAuthService {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly adminClient?: SupabaseClient<Database>,
    private readonly siteUrl?: string,
  ) {}

  async register(input: RegisterAuthInput): Promise<RegisterAuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      options: {
        data: {
          display_name: input.displayName,
        },
        emailRedirectTo: this.siteUrl ?? undefined,
      },
      password: input.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return {
          error: {
            code: "EMAIL_ALREADY_REGISTERED",
            message: "Email is already registered",
          },
          success: false,
        };
      }

      return toRegisterFailure("Registration failed");
    }

    if (!data.user?.id || !data.user.email) {
      return toRegisterFailure("Registration failed");
    }

    return {
      data: {
        email: data.user.email,
        requiresEmailVerification: true,
        userId: data.user.id,
      },
      success: true,
    };
  }

  async login(input: LoginAuthInput): Promise<LoginAuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        return {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
          success: false,
        };
      }

      return toLoginFailure("Login failed");
    }

    if (!data.user?.id || !data.user.email) {
      return {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
        success: false,
      };
    }

    return {
      data: {
        email: data.user.email,
        userId: data.user.id,
      },
      success: true,
    };
  }

  async logout(): Promise<LogoutAuthResult> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      return {
        error: {
          code: "AUTH_PROVIDER_ERROR",
          message: "Logout failed",
        },
        success: false,
      };
    }

    return {
      data: undefined,
      success: true,
    };
  }

  async deleteAccount(userId: string): Promise<DeleteAccountAuthResult> {
    if (!this.adminClient) {
      return {
        error: {
          code: "ADMIN_NOT_CONFIGURED",
          message: "Admin client is not configured",
        },
        success: false,
      };
    }

    const { error } = await this.adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return {
        error: {
          code: "AUTH_PROVIDER_ERROR",
          message: "Account deletion failed",
        },
        success: false,
      };
    }

    return {
      data: undefined,
      success: true,
    };
  }

  async resetPasswordForEmail(email: string): Promise<ResetPasswordResult> {
    const redirectTo = this.siteUrl
      ? `${this.siteUrl}/forgot-password`
      : undefined;

    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      if (error.status === 429) {
        return {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded",
          },
          success: false,
        };
      }

      return {
        error: {
          code: "AUTH_PROVIDER_ERROR",
          message: error.message,
        },
        success: false,
      };
    }

    return { data: undefined, success: true };
  }

  async verifyOtp(email: string, token: string): Promise<VerifyOtpResult> {
    const { error } = await this.client.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("expired")) {
        return {
          error: { code: "OTP_EXPIRED", message: "OTP has expired" },
          success: false,
        };
      }

      if (
        msg.includes("invalid") ||
        msg.includes("not found") ||
        msg.includes("otp")
      ) {
        return {
          error: { code: "INVALID_OTP", message: "OTP is invalid" },
          success: false,
        };
      }

      return {
        error: { code: "AUTH_PROVIDER_ERROR", message: error.message },
        success: false,
      };
    }

    return { data: undefined, success: true };
  }

  async updatePassword(newPassword: string): Promise<UpdatePasswordResult> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user) {
      return {
        error: { code: "NO_SESSION", message: "No active session" },
        success: false,
      };
    }

    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (error.message.toLowerCase().includes("password")) {
        return {
          error: { code: "WEAK_PASSWORD", message: error.message },
          success: false,
        };
      }

      return {
        error: { code: "AUTH_PROVIDER_ERROR", message: error.message },
        success: false,
      };
    }

    return { data: undefined, success: true };
  }
}
