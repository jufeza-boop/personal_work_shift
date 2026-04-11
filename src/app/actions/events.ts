"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreateEvent } from "@/application/use-cases/events/CreateEvent";
import { getAuthenticatedUser } from "@/infrastructure/auth/runtime";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import {
  EMPTY_EVENT_FORM_STATE,
  type EventFormState,
} from "@/presentation/components/events/types";
import {
  createPunctualEventSchema,
  createRecurringOtherEventSchema,
  createRecurringWorkEventSchema,
} from "@/presentation/validation/eventSchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";

async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toOptionalDate(value: string | undefined | ""): Date | undefined {
  if (!value) return undefined;

  return toDate(value);
}

function toOptionalString(value: string | undefined | ""): string | undefined {
  if (!value) return undefined;

  return value;
}

export async function createEventAction(
  previousState: EventFormState = EMPTY_EVENT_FORM_STATE,
  formData: FormData,
): Promise<EventFormState> {
  // Part of the useActionState API contract, but unused because success redirects.
  void previousState;

  const eventType = formData.get("eventType")?.toString();
  const familyId = formData.get("familyId")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!familyId) {
    return {
      message: "No se encontró la familia activa.",
      success: false,
    };
  }

  if (eventType === "punctual") {
    const parsed = createPunctualEventSchema.safeParse({
      date: formData.get("date"),
      description: formData.get("description"),
      endTime: formData.get("endTime"),
      startTime: formData.get("startTime"),
      title: formData.get("title"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        errors: {
          date: fieldErrors.date?.[0],
          description: fieldErrors.description?.[0],
          endTime: fieldErrors.endTime?.[0],
          startTime: fieldErrors.startTime?.[0],
          title: fieldErrors.title?.[0],
        },
        success: false,
      };
    }

    const user = await requireAuthenticatedUser(redirectTo);
    const { eventRepository, familyRepository } =
      await createServerEventDependencies();
    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      createdBy: user.id,
      date: toDate(parsed.data.date),
      description: parsed.data.description,
      endTime: toOptionalString(parsed.data.endTime),
      eventType: "punctual",
      familyId,
      startTime: toOptionalString(parsed.data.startTime),
      title: parsed.data.title,
    });

    if (!result.success) {
      return {
        message: buildErrorMessage(result.error.code),
        success: false,
      };
    }

    revalidatePath("/calendar");
    redirect(redirectTo);
  }

  if (eventType === "recurring-work") {
    const parsed = createRecurringWorkEventSchema.safeParse({
      category: formData.get("category"),
      description: formData.get("description"),
      endDate: formData.get("endDate"),
      frequencyInterval: formData.get("frequencyInterval"),
      frequencyUnit: formData.get("frequencyUnit"),
      shiftType: formData.get("shiftType"),
      startDate: formData.get("startDate"),
      title: formData.get("title"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        errors: {
          category: fieldErrors.category?.[0],
          description: fieldErrors.description?.[0],
          endDate: fieldErrors.endDate?.[0],
          frequencyInterval: fieldErrors.frequencyInterval?.[0],
          frequencyUnit: fieldErrors.frequencyUnit?.[0],
          shiftType: fieldErrors.shiftType?.[0],
          startDate: fieldErrors.startDate?.[0],
          title: fieldErrors.title?.[0],
        },
        success: false,
      };
    }

    const user = await requireAuthenticatedUser(redirectTo);
    const { eventRepository, familyRepository } =
      await createServerEventDependencies();
    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      category: parsed.data.category,
      createdBy: user.id,
      description: parsed.data.description,
      endDate: toOptionalDate(parsed.data.endDate),
      eventType: "recurring",
      familyId,
      frequencyInterval: parsed.data.frequencyInterval,
      frequencyUnit: parsed.data.frequencyUnit,
      shiftType: parsed.data.shiftType,
      startDate: toDate(parsed.data.startDate),
      title: parsed.data.title,
    });

    if (!result.success) {
      return {
        message: buildErrorMessage(result.error.code),
        success: false,
      };
    }

    revalidatePath("/calendar");
    redirect(redirectTo);
  }

  if (eventType === "recurring-other") {
    const parsed = createRecurringOtherEventSchema.safeParse({
      description: formData.get("description"),
      endDate: formData.get("endDate"),
      endTime: formData.get("endTime"),
      frequencyInterval: formData.get("frequencyInterval"),
      frequencyUnit: formData.get("frequencyUnit"),
      startDate: formData.get("startDate"),
      startTime: formData.get("startTime"),
      title: formData.get("title"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        errors: {
          description: fieldErrors.description?.[0],
          endDate: fieldErrors.endDate?.[0],
          endTime: fieldErrors.endTime?.[0],
          frequencyInterval: fieldErrors.frequencyInterval?.[0],
          frequencyUnit: fieldErrors.frequencyUnit?.[0],
          startDate: fieldErrors.startDate?.[0],
          startTime: fieldErrors.startTime?.[0],
          title: fieldErrors.title?.[0],
        },
        success: false,
      };
    }

    const user = await requireAuthenticatedUser(redirectTo);
    const { eventRepository, familyRepository } =
      await createServerEventDependencies();
    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      category: "other",
      createdBy: user.id,
      description: parsed.data.description,
      endDate: toOptionalDate(parsed.data.endDate),
      endTime: toOptionalString(parsed.data.endTime),
      eventType: "recurring",
      familyId,
      frequencyInterval: parsed.data.frequencyInterval,
      frequencyUnit: parsed.data.frequencyUnit,
      startDate: toDate(parsed.data.startDate),
      startTime: toOptionalString(parsed.data.startTime),
      title: parsed.data.title,
    });

    if (!result.success) {
      return {
        message: buildErrorMessage(result.error.code),
        success: false,
      };
    }

    revalidatePath("/calendar");
    redirect(redirectTo);
  }

  return {
    message: "Tipo de evento no reconocido.",
    success: false,
  };
}

function buildErrorMessage(
  code:
    | "FAMILY_NOT_FOUND"
    | "FORBIDDEN"
    | "INVALID_EVENT"
    | "NOT_A_FAMILY_MEMBER",
): string {
  switch (code) {
    case "FAMILY_NOT_FOUND":
      return "No se encontró la familia.";
    case "NOT_A_FAMILY_MEMBER":
      return "No perteneces a esta familia.";
    case "INVALID_EVENT":
      return "Los datos del evento no son válidos.";
    case "FORBIDDEN":
      return "No tienes permiso para crear este evento.";
  }
}
