import { loginAction } from "@/app/actions/auth";
import { LoginForm } from "@/presentation/components/auth/LoginForm";
import { EMPTY_AUTH_FORM_STATE } from "@/presentation/components/auth/types";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
    redirectTo?: string;
  }>;
}

function getStatusMessage(message?: string): string | undefined {
  switch (message) {
    case "logged-out":
      return "Tu sesión se cerró correctamente.";
    case "registered":
      return "Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.";
    default:
      return undefined;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const message = getStatusMessage(params.message);

  return (
    <LoginForm
      action={loginAction}
      redirectTo={sanitizeRedirectPath(params.redirectTo)}
      state={{
        ...EMPTY_AUTH_FORM_STATE,
        message,
      }}
    />
  );
}
