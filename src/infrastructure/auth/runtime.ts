import { cookies } from "next/headers";
import type { IAuthService } from "@/application/services/IAuthService";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { MockAuthAdapter } from "@/infrastructure/auth/MockAuthAdapter";
import { MockUserRepository } from "@/infrastructure/auth/MockUserRepository";
import {
  findMockUserById,
  MOCK_SESSION_COOKIE,
} from "@/infrastructure/auth/mockAuthStore";
import { SupabaseAuthAdapter } from "@/infrastructure/auth/SupabaseAuthAdapter";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SupabaseUserRepository } from "@/infrastructure/supabase/SupabaseUserRepository";

export interface AuthenticatedUser {
  email: string;
  id: string;
}

export function isMockAuthEnabled(): boolean {
  return process.env.AUTH_DRIVER === "mock";
}

export async function createServerAuthDependencies(): Promise<{
  authService: IAuthService;
  userRepository: IUserRepository;
}> {
  if (isMockAuthEnabled()) {
    const cookieStore = await cookies();

    return {
      authService: new MockAuthAdapter(cookieStore),
      userRepository: new MockUserRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    authService: new SupabaseAuthAdapter(supabase),
    userRepository: new SupabaseUserRepository(supabase),
  };
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  if (isMockAuthEnabled()) {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(MOCK_SESSION_COOKIE)?.value;

    if (!sessionId) {
      return null;
    }

    const user = findMockUserById(sessionId);

    return user
      ? {
          email: user.email,
          id: user.id,
        }
      : null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email
    ? {
        email: user.email,
        id: user.id,
      }
    : null;
}
