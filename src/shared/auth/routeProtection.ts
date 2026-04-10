const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/calendar"];

export function resolveAuthRedirect(
  pathname: string,
  isAuthenticated: boolean,
): string | null {
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    return `/login?redirectTo=${encodeURIComponent(pathname)}`;
  }

  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return "/calendar";
  }

  return null;
}

export function sanitizeRedirectPath(
  pathname: string | null | undefined,
): string {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/calendar";
  }

  return pathname;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
