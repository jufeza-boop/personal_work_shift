import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { AuthenticatedUser } from "@/infrastructure/auth/runtime";
import type { Database } from "@/infrastructure/supabase/database.types";
import { getAppEnv } from "@/shared/config/env";

export async function updateAuthSession(
  request: NextRequest,
): Promise<{
  response: NextResponse;
  user: AuthenticatedUser | null;
}> {
  const env = getAppEnv();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, options, value }) => {
            request.cookies.set({
              ...options,
              name,
              value,
            });
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response,
    user: user?.email
      ? {
          email: user.email,
          id: user.id,
        }
      : null,
  };
}
