"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AddDelegatedUserToFamily } from "@/application/use-cases/family/AddDelegatedUserToFamily";
import { AddMember } from "@/application/use-cases/family/AddMember";
import { CreateDelegatedUser } from "@/application/use-cases/family/CreateDelegatedUser";
import { CreateFamily } from "@/application/use-cases/family/CreateFamily";
import { DeleteFamily } from "@/application/use-cases/family/DeleteFamily";
import { LeaveFamily } from "@/application/use-cases/family/LeaveFamily";
import { RemoveDelegatedUser } from "@/application/use-cases/family/RemoveDelegatedUser";
import { RemoveFamilyMember } from "@/application/use-cases/family/RemoveFamilyMember";
import { RenameFamily } from "@/application/use-cases/family/RenameFamily";
import { SelectPalette } from "@/application/use-cases/family/SelectPalette";
import { SwitchFamily } from "@/application/use-cases/family/SwitchFamily";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerFamilyDependencies } from "@/infrastructure/family/runtime";
import {
  EMPTY_FAMILY_FORM_STATE,
  type FamilyFormState,
} from "@/presentation/components/family/types";
import {
  createDelegatedUserSchema,
  createFamilySchema,
  inviteFamilyMemberSchema,
  renameFamilySchema,
  selectPaletteSchema,
} from "@/presentation/validation/familySchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";
import { ACTIVE_FAMILY_COOKIE } from "@/shared/family/activeFamily";

function toFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): FamilyFormState["errors"] {
  return {
    colorPalette: fieldErrors.colorPalette?.[0],
    displayName: fieldErrors.displayName?.[0],
    email: fieldErrors.email?.[0],
    name: fieldErrors.name?.[0],
  };
}

async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

async function persistActiveFamily(familyId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACTIVE_FAMILY_COOKIE, familyId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });
}

export async function createFamilyAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  // Part of the useActionState API contract, but unused because success redirects.
  void previousState;

  const parsed = createFamilySchema.safeParse({
    name: formData.get("name"),
    colorPalette: formData.get("colorPalette") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const useCase = new CreateFamily(familyRepository, userRepository);
  const result = await useCase.execute({
    createdBy: user.id,
    name: parsed.data.name,
    ownerColorPalette: parsed.data.colorPalette,
  });

  if (!result.success) {
    return {
      errors:
        result.error.code === "INVALID_NAME"
          ? {
              name: result.error.message,
            }
          : undefined,
      message:
        result.error.code === "USER_NOT_FOUND"
          ? "No se pudo validar tu cuenta para crear la familia."
          : undefined,
      success: false,
    };
  }

  await persistActiveFamily(result.data.family.id);
  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function addFamilyMemberAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  // Part of the useActionState API contract, but unused because success redirects.
  void previousState;

  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
    return {
      message: "No se encontró la familia activa.",
      success: false,
    };
  }

  const parsed = inviteFamilyMemberSchema.safeParse({
    colorPalette: formData.get("colorPalette"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const useCase = new AddMember(familyRepository, userRepository);
  const result = await useCase.execute({
    colorPalette: parsed.data.colorPalette,
    email: parsed.data.email,
    familyId,
    requesterUserId: user.id,
  });

  if (!result.success) {
    if (result.error.code === "USER_NOT_FOUND") {
      return {
        errors: {
          email: "Ese correo todavía no tiene una cuenta registrada.",
        },
        success: false,
      };
    }

    if (result.error.code === "COLOR_PALETTE_ALREADY_TAKEN") {
      return {
        errors: {
          colorPalette: "La paleta elegida ya está ocupada en esta familia.",
        },
        success: false,
      };
    }

    if (result.error.code === "MEMBER_ALREADY_EXISTS") {
      return {
        errors: {
          email: "Ese usuario ya forma parte de esta familia.",
        },
        success: false,
      };
    }

    return {
      message: "No tienes permiso para añadir miembros a esta familia.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function renameFamilyAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  // Part of the useActionState API contract, but unused because success redirects.
  void previousState;

  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
    return {
      message: "No se encontró la familia activa.",
      success: false,
    };
  }

  const parsed = renameFamilySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new RenameFamily(familyRepository);
  const result = await useCase.execute({
    familyId,
    name: parsed.data.name,
    requesterUserId: user.id,
  });

  if (!result.success) {
    return {
      errors:
        result.error.code === "INVALID_NAME"
          ? {
              name: result.error.message,
            }
          : undefined,
      message: "No tienes permiso para renombrar esta familia.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function switchFamilyAction(formData: FormData): Promise<void> {
  const familyId = formData.get("familyId")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!familyId) {
    redirect(redirectTo);
  }

  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new SwitchFamily(familyRepository);
  const result = await useCase.execute({
    familyId,
    userId: user.id,
  });

  if (!result.success) {
    redirect(redirectTo);
  }

  await persistActiveFamily(result.data.family.id);
  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function selectPaletteAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  // Part of the useActionState API contract, but unused because success redirects.
  void previousState;

  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
    return {
      message: "No se encontró la familia activa.",
      success: false,
    };
  }

  const parsed = selectPaletteSchema.safeParse({
    colorPalette: formData.get("colorPalette"),
  });

  if (!parsed.success) {
    return {
      errors: {
        colorPalette: parsed.error.flatten().fieldErrors.colorPalette?.[0],
      },
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new SelectPalette(familyRepository);
  const result = await useCase.execute({
    colorPalette: parsed.data.colorPalette,
    familyId,
    userId: user.id,
  });

  if (!result.success) {
    if (result.error.code === "COLOR_PALETTE_ALREADY_TAKEN") {
      return {
        errors: {
          colorPalette: "La paleta elegida ya está ocupada en esta familia.",
        },
        success: false,
      };
    }

    return {
      message: "No se pudo actualizar tu paleta de color.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function deleteFamilyAction(formData: FormData): Promise<void> {
  const familyId = formData.get("familyId")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!familyId) {
    redirect(redirectTo);
  }

  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new DeleteFamily(familyRepository);
  const result = await useCase.execute({
    familyId,
    requesterUserId: user.id,
  });

  if (!result.success) {
    redirect(redirectTo);
  }

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_FAMILY_COOKIE);
  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect("/calendar");
}

export async function createDelegatedUserAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  void previousState;

  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
    return {
      message: "No se encontró la familia activa.",
      success: false,
    };
  }

  const parsed = createDelegatedUserSchema.safeParse({
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return {
      errors: toFieldErrors(parsed.error.flatten().fieldErrors),
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const useCase = new CreateDelegatedUser(userRepository, familyRepository);
  const result = await useCase.execute({
    displayName: parsed.data.displayName,
    familyId,
    parentId: user.id,
  });

  if (!result.success) {
    if (result.error.code === "INVALID_DISPLAY_NAME") {
      return {
        errors: { displayName: result.error.message },
        success: false,
      };
    }

    return {
      message: "No se pudo crear el usuario delegado.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}

export async function removeDelegatedUserAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  void previousState;

  const delegatedUserId = formData.get("delegatedUserId")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!delegatedUserId) {
    return {
      message: "No se encontró el usuario delegado.",
      success: false,
    };
  }

  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const useCase = new RemoveDelegatedUser(userRepository, familyRepository);

  const result = await useCase.execute({
    delegatedUserId,
    parentId: user.id,
  });

  if (!result.success) {
    if (result.error.code === "USER_NOT_FOUND") {
      return {
        message: "El usuario delegado no se encontró.",
        success: false,
      };
    }

    return {
      message: "No tienes permiso para eliminar este usuario delegado.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  revalidatePath("/calendar/delegated-users");

  return {
    message: "Usuario delegado eliminado correctamente.",
    success: true,
  };
}

export async function removeFamilyMemberAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  void previousState;

  const familyId = formData.get("familyId")?.toString();
  const memberUserId = formData.get("memberUserId")?.toString();

  if (!familyId || !memberUserId) {
    return {
      message: "Faltan datos para eliminar al miembro.",
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new RemoveFamilyMember(familyRepository);

  const result = await useCase.execute({
    familyId,
    memberUserId,
    requesterUserId: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      CANNOT_REMOVE_OWNER: "No se puede eliminar al propietario de la familia.",
      FAMILY_NOT_FOUND: "No se encontró la familia.",
      FORBIDDEN: "Solo el propietario puede eliminar miembros.",
      MEMBER_NOT_FOUND: "Ese usuario no es miembro de esta familia.",
    };

    return {
      message: messages[result.error.code] ?? "No se pudo eliminar al miembro.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");

  return {
    message: "Miembro eliminado de la familia.",
    success: true,
  };
}

export async function leaveFamilyAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  void previousState;

  const familyId = formData.get("familyId")?.toString();

  if (!familyId) {
    return {
      message: "No se encontró la familia.",
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository } = await createServerFamilyDependencies();
  const useCase = new LeaveFamily(familyRepository);

  const result = await useCase.execute({
    familyId,
    userId: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      FAMILY_NOT_FOUND: "No se encontró la familia.",
      NOT_A_MEMBER: "No eres miembro de esta familia.",
      OWNER_CANNOT_LEAVE:
        "El propietario no puede abandonar la familia. Elimínala en su lugar.",
    };

    return {
      message:
        messages[result.error.code] ?? "No se pudo abandonar la familia.",
      success: false,
    };
  }

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_FAMILY_COOKIE);
  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect("/calendar");
}

export async function addDelegatedUserToFamilyAction(
  previousState: FamilyFormState = EMPTY_FAMILY_FORM_STATE,
  formData: FormData,
): Promise<FamilyFormState> {
  void previousState;

  const familyId = formData.get("familyId")?.toString();
  const delegatedUserId = formData.get("delegatedUserId")?.toString();

  if (!familyId || !delegatedUserId) {
    return {
      message: "Faltan datos para añadir al usuario delegado.",
      success: false,
    };
  }

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireAuthenticatedUser(redirectTo);
  const { familyRepository, userRepository } =
    await createServerFamilyDependencies();
  const useCase = new AddDelegatedUserToFamily(
    userRepository,
    familyRepository,
  );

  const result = await useCase.execute({
    delegatedUserId,
    familyId,
    requesterUserId: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      FAMILY_NOT_FOUND: "No se encontró la familia.",
      FORBIDDEN: "No tienes permiso para añadir este usuario delegado.",
      MEMBER_ALREADY_EXISTS: "Este usuario ya es miembro de la familia.",
      NOT_DELEGATED: "El usuario seleccionado no es un usuario delegado.",
      USER_NOT_FOUND: "No se encontró el usuario delegado.",
    };

    return {
      message:
        messages[result.error.code] ??
        "No se pudo añadir al usuario delegado.",
      success: false,
    };
  }

  revalidatePath("/calendar");
  revalidatePath("/calendar/settings");
  redirect(redirectTo);
}
