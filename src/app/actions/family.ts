"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AddMember } from "@/application/use-cases/family/AddMember";
import { CreateFamily } from "@/application/use-cases/family/CreateFamily";
import { DeleteFamily } from "@/application/use-cases/family/DeleteFamily";
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
