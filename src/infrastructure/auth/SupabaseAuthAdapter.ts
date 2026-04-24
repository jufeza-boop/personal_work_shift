import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DeleteAccountAuthResult,
  IAuthService,
  LoginAuthInput,
  LoginAuthResult,
  LogoutAuthResult,
  RegisterAuthInput,
  RegisterAuthResult,
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
}
