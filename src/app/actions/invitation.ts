"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AcceptInvitation } from "@/application/use-cases/family/AcceptInvitation";
import { CancelInvitation } from "@/application/use-cases/family/CancelInvitation";
import { CreateInvitation } from "@/application/use-cases/family/CreateInvitation";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerInvitationDependencies } from "@/infrastructure/invitation/runtime";
import type { InvitationFormState } from "@/presentation/components/family/invitationTypes";
import { acceptInvitationSchema } from "@/presentation/validation/invitationSchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";

const EMPTY: InvitationFormState = { success: false };

async function requireUser(redirectPath: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectPath)}`);
  }

  return user;
}

export async function createInvitationAction(
  previousState: InvitationFormState = EMPTY,
  formData: FormData,
): Promise<InvitationFormState> {
  void previousState;

  const familyId = formData.get("familyId")?.toString() ?? "";
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireUser(redirectTo);
  const siteUrl =
    process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";

  const { familyRepository, invitationRepository } =
    await createServerInvitationDependencies();
  const useCase = new CreateInvitation(familyRepository, invitationRepository);
  const result = await useCase.execute({
    familyId,
    requestedBy: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      FAMILY_NOT_FOUND: "La familia no existe.",
      FORBIDDEN: "Solo el propietario puede crear invitaciones.",
    };

    return {
      message: messages[result.error.code] ?? "Error al crear la invitación.",
      success: false,
    };
  }

  const invitationUrl = `${siteUrl}/invite/${result.data.invitation.token}`;

  revalidatePath("/calendar/settings");

  return {
    invitationUrl,
    message: "¡Invitación creada! Comparte el enlace con quien quieras.",
    success: true,
  };
}

export async function cancelInvitationAction(
  previousState: InvitationFormState = EMPTY,
  formData: FormData,
): Promise<InvitationFormState> {
  void previousState;

  const invitationId = formData.get("invitationId")?.toString() ?? "";
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );
  const user = await requireUser(redirectTo);

  const { familyRepository, invitationRepository } =
    await createServerInvitationDependencies();
  const useCase = new CancelInvitation(invitationRepository, familyRepository);
  const result = await useCase.execute({
    invitationId,
    requestedBy: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      FORBIDDEN: "Solo el propietario puede cancelar invitaciones.",
      INVITATION_NOT_ACTIVE: "Esta invitación ya no está activa.",
      INVITATION_NOT_FOUND: "La invitación no existe.",
    };

    return {
      message:
        messages[result.error.code] ?? "Error al cancelar la invitación.",
      success: false,
    };
  }

  revalidatePath("/calendar/settings");

  return {
    message: "Invitación cancelada correctamente.",
    success: true,
  };
}

export async function acceptInvitationAction(
  previousState: InvitationFormState = EMPTY,
  formData: FormData,
): Promise<InvitationFormState> {
  void previousState;

  const parsed = acceptInvitationSchema.safeParse({
    colorPalette: formData.get("colorPalette"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        colorPalette: fieldErrors.colorPalette?.[0],
        token: fieldErrors.token?.[0],
      },
      success: false,
    };
  }

  const user = await requireUser("/calendar");
  const { familyRepository, invitationRepository, userRepository } =
    await createServerInvitationDependencies();
  const useCase = new AcceptInvitation(
    familyRepository,
    invitationRepository,
    userRepository,
  );
  const result = await useCase.execute({
    colorPalette: parsed.data.colorPalette,
    token: parsed.data.token,
    userId: user.id,
  });

  if (!result.success) {
    const messages: Record<string, string> = {
      ALREADY_MEMBER: "Ya eres miembro de esta familia.",
      COLOR_PALETTE_ALREADY_TAKEN:
        "La paleta de color elegida ya está en uso. Por favor selecciona otra.",
      FAMILY_NOT_FOUND: "La familia asociada a esta invitación ya no existe.",
      INVITATION_NOT_FOUND:
        "Esta invitación no existe o el enlace es inválido.",
      INVITATION_NOT_USABLE:
        "Esta invitación ya no es válida. Puede haber caducado, sido usada o cancelada.",
      USER_NOT_FOUND:
        "No se encontró tu usuario. Intenta iniciar sesión de nuevo.",
    };

    return {
      errors:
        result.error.code === "COLOR_PALETTE_ALREADY_TAKEN"
          ? { colorPalette: messages[result.error.code] }
          : undefined,
      message: messages[result.error.code] ?? "Error al unirte a la familia.",
      success: false,
    };
  }

  redirect("/calendar");
}
