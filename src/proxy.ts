import { NextResponse, type NextRequest } from "next/server";
import {
  findMockUserById,
  MOCK_SESSION_COOKIE,
} from "@/infrastructure/auth/mockAuthStore";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { updateAuthSession } from "@/infrastructure/supabase/middleware";
import { resolveAuthRedirect } from "@/shared/auth/routeProtection";

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  return to;
}

export async function proxy(request: NextRequest) {
  if (isMockAuthEnabled()) {
    const sessionId = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
    const isAuthenticated = Boolean(sessionId && findMockUserById(sessionId));
    const redirectPath = resolveAuthRedirect(
      request.nextUrl.pathname,
      isAuthenticated,
    );

    return redirectPath
      ? NextResponse.redirect(new URL(redirectPath, request.url))
      : NextResponse.next();
  }

  const { response, user } = await updateAuthSession(request);
  const redirectPath = resolveAuthRedirect(request.nextUrl.pathname, user !== null);

  if (!redirectPath) {
    return response;
  }

  const redirectResponse = NextResponse.redirect(new URL(redirectPath, request.url));

  return copyCookies(response, redirectResponse);
}

// Protect authenticated calendar pages and redirect authenticated users away
// from auth-only entry points.
export const config = {
  matcher: ["/calendar/:path*", "/login", "/register"],
};
