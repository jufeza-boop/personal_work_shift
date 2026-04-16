"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreateEvent } from "@/application/use-cases/events/CreateEvent";
import { DeleteEvent } from "@/application/use-cases/events/DeleteEvent";
import { EditEvent } from "@/application/use-cases/events/EditEvent";
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
  editPunctualEventSchema,
  editRecurringOtherEventSchema,
  editRecurringWorkEventSchema,
} from "@/presentation/validation/eventSchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";

async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

/**
 * Resolves the effective `createdBy` / `requestedBy` ID for delegation.
 *
 * If `targetUserId` is supplied and different from `authenticatedUserId`,
 * we verify that the target is actually a delegated user of the authenticated
 * user before allowing the operation.  Returns `null` when the caller does
 * not have permission to act on behalf of `targetUserId`.
 */
async function resolveCreatedBy(
  authenticatedUserId: string,
  targetUserId: string | undefined,
  getDelegatedUsers: () => Promise<{ id: string }[]>,
): Promise<string | null> {
  if (!targetUserId || targetUserId === authenticatedUserId) {
    return authenticatedUserId;
  }

  const delegatedUsers = await getDelegatedUsers();

  if (delegatedUsers.some((u) => u.id === targetUserId)) {
    return targetUserId;
  }

  return null; // not authorized to act on behalf of targetUserId
}

/**
 * When editing or deleting an event whose `createdBy` differs from the
 * authenticated user, check whether the event creator is a delegated user of
 * the authenticated user and, if so, return the creator's ID as the effective
 * requester so the ownership check inside the use case passes.
 */
async function resolveRequestedBy(
  authenticatedUserId: string,
  eventCreatedBy: string,
  getDelegatedUsers: () => Promise<{ id: string }[]>,
): Promise<string> {
  if (eventCreatedBy === authenticatedUserId) {
    return authenticatedUserId;
  }

  const delegatedUsers = await getDelegatedUsers();

  if (delegatedUsers.some((u) => u.id === eventCreatedBy)) {
    return eventCreatedBy;
  }

  return authenticatedUserId; // will result in FORBIDDEN inside the use case
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
  const targetUserId = formData.get("targetUserId")?.toString() || undefined;
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
    const { eventRepository, familyRepository, userRepository } =
      await createServerEventDependencies();
    const createdBy = await resolveCreatedBy(user.id, targetUserId, () =>
      userRepository.findDelegatedUsers(user.id),
    );

    if (!createdBy) {
      return {
        message:
          "No tienes permiso para crear eventos en nombre de ese usuario.",
        success: false,
      };
    }

    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      createdBy,
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
    const { eventRepository, familyRepository, userRepository } =
      await createServerEventDependencies();
    const createdBy = await resolveCreatedBy(user.id, targetUserId, () =>
      userRepository.findDelegatedUsers(user.id),
    );

    if (!createdBy) {
      return {
        message:
          "No tienes permiso para crear eventos en nombre de ese usuario.",
        success: false,
      };
    }

    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      category: parsed.data.category,
      createdBy,
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
    const { eventRepository, familyRepository, userRepository } =
      await createServerEventDependencies();
    const createdBy = await resolveCreatedBy(user.id, targetUserId, () =>
      userRepository.findDelegatedUsers(user.id),
    );

    if (!createdBy) {
      return {
        message:
          "No tienes permiso para crear eventos en nombre de ese usuario.",
        success: false,
      };
    }

    const useCase = new CreateEvent(eventRepository, familyRepository);
    const result = await useCase.execute({
      category: "other",
      createdBy,
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

export async function editEventAction(
  previousState: EventFormState = EMPTY_EVENT_FORM_STATE,
  formData: FormData,
): Promise<EventFormState> {
  void previousState;

  const eventId = formData.get("eventId")?.toString();
  const scope = formData.get("scope")?.toString() as
    | "all"
    | "single"
    | undefined;
  const eventType = formData.get("eventType")?.toString();
  const occurrenceDateRaw = formData.get("occurrenceDate")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!eventId) {
    return { success: false, message: "Falta el identificador del evento." };
  }

  const user = await requireAuthenticatedUser(redirectTo);
  const { eventRepository, userRepository } =
    await createServerEventDependencies();
  const useCase = new EditEvent(eventRepository);

  // Resolve the effective requestedBy to support delegation.
  const event = await eventRepository.findById(eventId);
  const requestedBy = event
    ? await resolveRequestedBy(user.id, event.createdBy, () =>
        userRepository.findDelegatedUsers(user.id),
      )
    : user.id;

  if (eventType === "punctual") {
    const parsed = editPunctualEventSchema.safeParse({
      eventId,
      scope,
      occurrenceDate: occurrenceDateRaw,
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          title: fieldErrors.title?.[0],
          description: fieldErrors.description?.[0],
          date: fieldErrors.date?.[0],
          startTime: fieldErrors.startTime?.[0],
          endTime: fieldErrors.endTime?.[0],
        },
      };
    }

    const result = await useCase.execute({
      scope: "all",
      eventId,
      requestedBy,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      date: toDate(parsed.data.date),
      startTime: toOptionalString(parsed.data.startTime) ?? null,
      endTime: toOptionalString(parsed.data.endTime) ?? null,
    });

    if (!result.success) {
      return { success: false, message: buildErrorMessage(result.error.code) };
    }

    revalidatePath("/calendar");
    redirect(redirectTo);
  }

  if (eventType === "recurring-work" || eventType === "recurring-other") {
    const schema =
      eventType === "recurring-work"
        ? editRecurringWorkEventSchema
        : editRecurringOtherEventSchema;
    const parsed = schema.safeParse({
      eventId,
      scope,
      occurrenceDate: occurrenceDateRaw,
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      frequencyUnit: formData.get("frequencyUnit"),
      frequencyInterval: formData.get("frequencyInterval"),
      shiftType:
        eventType === "recurring-work" ? formData.get("shiftType") : undefined,
      startTime:
        eventType === "recurring-other" ? formData.get("startTime") : undefined,
      endTime:
        eventType === "recurring-other" ? formData.get("endTime") : undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        errors: {
          title: fieldErrors.title?.[0],
          description: fieldErrors.description?.[0],
          startDate: fieldErrors.startDate?.[0],
          endDate: fieldErrors.endDate?.[0],
          frequencyUnit: fieldErrors.frequencyUnit?.[0],
          frequencyInterval: fieldErrors.frequencyInterval?.[0],
        },
      };
    }

    if (parsed.data.scope === "single") {
      if (!occurrenceDateRaw) {
        return {
          success: false,
          message: "Selecciona la fecha de la ocurrencia.",
        };
      }
      const occurrenceDate = toDate(occurrenceDateRaw);
      const result = await useCase.execute({
        scope: "single",
        eventId,
        requestedBy,
        occurrenceDate,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        startTime:
          "startTime" in parsed.data
            ? (toOptionalString(parsed.data.startTime) ?? null)
            : null,
        endTime:
          "endTime" in parsed.data
            ? (toOptionalString(parsed.data.endTime) ?? null)
            : null,
      });

      if (!result.success) {
        return {
          success: false,
          message: buildErrorMessage(result.error.code),
        };
      }

      revalidatePath("/calendar");
      redirect(redirectTo);
    }

    // scope "all" for recurring
    const result = await useCase.execute({
      scope: "all",
      eventId,
      requestedBy,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startDate: parsed.data.startDate
        ? toDate(parsed.data.startDate)
        : undefined,
      endDate: parsed.data.endDate ? toDate(parsed.data.endDate) : undefined,
      frequencyUnit: parsed.data.frequencyUnit,
      frequencyInterval: parsed.data.frequencyInterval,
      shiftType: "shiftType" in parsed.data ? parsed.data.shiftType : undefined,
      startTime:
        "startTime" in parsed.data
          ? (toOptionalString(parsed.data.startTime) ?? null)
          : null,
      endTime:
        "endTime" in parsed.data
          ? (toOptionalString(parsed.data.endTime) ?? null)
          : null,
    });

    if (!result.success) {
      return { success: false, message: buildErrorMessage(result.error.code) };
    }

    revalidatePath("/calendar");
    redirect(redirectTo);
  }

  return { success: false, message: "Tipo de evento no reconocido." };
}

export async function deleteEventAction(
  previousState: EventFormState = EMPTY_EVENT_FORM_STATE,
  formData: FormData,
): Promise<EventFormState> {
  void previousState;

  const eventId = formData.get("eventId")?.toString();
  const scope = formData.get("scope")?.toString() as
    | "all"
    | "single"
    | undefined;
  const occurrenceDateRaw = formData.get("occurrenceDate")?.toString();
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!eventId) {
    return { success: false, message: "Falta el identificador del evento." };
  }

  const user = await requireAuthenticatedUser(redirectTo);
  const { eventRepository, userRepository } =
    await createServerEventDependencies();
  const useCase = new DeleteEvent(eventRepository);

  // Resolve the effective requestedBy to support delegation.
  const event = await eventRepository.findById(eventId);
  const requestedBy = event
    ? await resolveRequestedBy(user.id, event.createdBy, () =>
        userRepository.findDelegatedUsers(user.id),
      )
    : user.id;

  if (scope === "single") {
    if (!occurrenceDateRaw) {
      return {
        success: false,
        message: "Selecciona la fecha de la ocurrencia.",
      };
    }
    const result = await useCase.execute({
      scope: "single",
      eventId,
      requestedBy,
      occurrenceDate: toDate(occurrenceDateRaw),
    });

    if (!result.success) {
      return { success: false, message: buildErrorMessage(result.error.code) };
    }
  } else {
    const result = await useCase.execute({
      scope: "all",
      eventId,
      requestedBy,
    });

    if (!result.success) {
      return { success: false, message: buildErrorMessage(result.error.code) };
    }
  }

  revalidatePath("/calendar");
  redirect(redirectTo);
}

function buildErrorMessage(
  code:
    | "FAMILY_NOT_FOUND"
    | "FORBIDDEN"
    | "INVALID_EVENT"
    | "NOT_A_FAMILY_MEMBER"
    | "EVENT_NOT_FOUND"
    | "INVALID_SCOPE",
): string {
  switch (code) {
    case "FAMILY_NOT_FOUND":
      return "No se encontró la familia.";
    case "NOT_A_FAMILY_MEMBER":
      return "No perteneces a esta familia.";
    case "INVALID_EVENT":
      return "Los datos del evento no son válidos.";
    case "FORBIDDEN":
      return "No tienes permiso para realizar esta acción.";
    case "EVENT_NOT_FOUND":
      return "No se encontró el evento.";
    case "INVALID_SCOPE":
      return "Esta acción no es válida para este tipo de evento.";
  }
}
