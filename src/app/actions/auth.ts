"use server";

import { redirect } from "next/navigation";
import { LoginUser } from "@/application/use-cases/auth/LoginUser";
import { LogoutUser } from "@/application/use-cases/auth/LogoutUser";
import { RegisterUser } from "@/application/use-cases/auth/RegisterUser";
import { createServerAuthDependencies } from "@/infrastructure/auth/runtime";
import {
  type AuthFormState,
  EMPTY_AUTH_FORM_STATE,
} from "@/presentation/components/auth/types";
import {
  loginSchema,
  registerSchema,
} from "@/presentation/validation/authSchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";

function toFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): AuthFormState["errors"] {
  return {
    displayName: fieldErrors.displayName?.[0],
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  };
}

export async function registerAction(
  _previousState: AuthFormState = EMPTY_AUTH_FORM_STATE,
  formData: FormData,
): Promise<AuthFormState> {
  // Required by the useActionState server action signature.
  void _previousState;

  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const { authService, userRepository } = await createServerAuthDependencies();
  const useCase = new RegisterUser(userRepository, authService);
  const result = await useCase.execute(parsed.data);

  if (!result.success) {
    if (result.error.code === "EMAIL_ALREADY_REGISTERED") {
      return {
        errors: {
          email: "Ya existe una cuenta con este correo.",
        },
        success: false,
      };
    }

    if (result.error.code === "WEAK_PASSWORD") {
      return {
        errors: {
          password:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        },
        success: false,
      };
    }

    return {
      message: "No se pudo crear la cuenta. Inténtalo de nuevo.",
      success: false,
    };
  }

  redirect("/login?message=registered");
}

export async function loginAction(
  _previousState: AuthFormState = EMPTY_AUTH_FORM_STATE,
  formData: FormData,
): Promise<AuthFormState> {
  // Required by the useActionState server action signature.
  void _previousState;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(formData.get("redirectTo")?.toString());
  const { authService } = await createServerAuthDependencies();
  const useCase = new LoginUser(authService);
  const result = await useCase.execute(parsed.data);

  if (!result.success) {
    return {
      message: "Correo o contraseña incorrectos.",
      success: false,
    };
  }

  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const { authService } = await createServerAuthDependencies();
  const useCase = new LogoutUser(authService);

  await useCase.execute();

  redirect("/login?message=logged-out");
}
