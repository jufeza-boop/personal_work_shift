"use server";

import { UpdateProfile } from "@/application/use-cases/auth/UpdateProfile";
import { createServerAuthDependencies } from "@/infrastructure/auth/runtime";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import {
  updateDisplayNameSchema,
  updateProfilePasswordSchema,
} from "@/presentation/validation/profileSchemas";

export interface ProfileFormState {
  errors?: Record<string, string | undefined>;
  message?: string;
  success: boolean;
}

export const EMPTY_PROFILE_FORM_STATE: ProfileFormState = { success: false };

export async function updateDisplayNameAction(
  _previousState: ProfileFormState = EMPTY_PROFILE_FORM_STATE,
  formData: FormData,
): Promise<ProfileFormState> {
  void _previousState;

  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    return { message: "No hay sesión activa.", success: false };
  }

  const parsed = updateDisplayNameSchema.safeParse({
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: { displayName: fieldErrors.displayName?.[0] },
      success: false,
    };
  }

  const { userRepository } = await createServerAuthDependencies();
  const useCase = new UpdateProfile(userRepository);
  const result = await useCase.execute({
    displayName: parsed.data.displayName,
    userId: currentUser.id,
  });

  if (!result.success) {
    if (result.error.code === "USER_NOT_FOUND") {
      return { message: "Usuario no encontrado.", success: false };
    }

    if (result.error.code === "INVALID_DISPLAY_NAME") {
      return {
        errors: { displayName: "El nombre no puede estar vacío." },
        success: false,
      };
    }

    return {
      message: "No se pudo actualizar el nombre. Inténtalo de nuevo.",
      success: false,
    };
  }

  return { success: true };
}

export async function updateProfilePasswordAction(
  _previousState: ProfileFormState = EMPTY_PROFILE_FORM_STATE,
  formData: FormData,
): Promise<ProfileFormState> {
  void _previousState;

  const parsed = updateProfilePasswordSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const formErrors = parsed.error.flatten().formErrors;

    return {
      errors: {
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? formErrors?.[0],
        newPassword: fieldErrors.newPassword?.[0],
      },
      success: false,
    };
  }

  const { authService } = await createServerAuthDependencies();
  const result = await authService.updatePassword(parsed.data.newPassword);

  if (!result.success) {
    if (result.error.code === "WEAK_PASSWORD") {
      return {
        errors: {
          newPassword:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        },
        success: false,
      };
    }

    if (result.error.code === "NO_SESSION") {
      return {
        message: "La sesión ha expirado. Por favor, inicia sesión de nuevo.",
        success: false,
      };
    }

    return {
      message: "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
      success: false,
    };
  }

  return { success: true };
}
