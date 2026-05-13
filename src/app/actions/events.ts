"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreateEvent } from "@/application/use-cases/events/CreateEvent";
import { DeleteEvent } from "@/application/use-cases/events/DeleteEvent";
import { EditEvent } from "@/application/use-cases/events/EditEvent";
import type { EventCategory } from "@/domain/entities/RecurringEvent";
import type { EventChangeType } from "@/application/use-cases/push/SendEventNotification";
import { createServerEventDependencies } from "@/infrastructure/events/runtime";
import { createServerPushDependencies } from "@/infrastructure/push/runtime";
import { notifyFamilyOnEventChange } from "@/application/services/notifyFamilyOnEventChange";
import { type EventFormState } from "@/presentation/components/events/types";
import {
  createPunctualEventSchema,
  createRecurringEventSchema,
  editPunctualEventSchema,
  editRecurringEventSchema,
} from "@/presentation/validation/eventSchemas";
import { sanitizeRedirectPath } from "@/shared/auth/routeProtection";
import { requireAuthenticatedUser } from "@/shared/auth/requireAuthenticatedUser";

/**
 * Thin wrapper that resolves server-side dependencies and delegates to the
 * application-layer `notifyFamilyOnEventChange` helper.
 *
 * Failures are silently logged so they never break the main event flow.
 */
async function dispatchFamilyNotification(
  actorUserId: string,
  familyId: string,
  eventTitle: string,
  changeType: EventChangeType,
  eventDate?: string,
): Promise<void> {
  try {
    const { familyRepository } = await createServerEventDependencies();
    const { pushSubscriptionRepository, pushNotificationService } =
      await createServerPushDependencies();

    await notifyFamilyOnEventChange(
      actorUserId,
      familyId,
      eventTitle,
      changeType,
      eventDate,
      familyRepository,
      pushSubscriptionRepository,
      pushNotificationService,
    );
  } catch (error) {
    console.error(
      "[dispatchFamilyNotification] Push notification error:",
      error,
    );
  }
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

// ─── Create-event branch helpers ─────────────────────────────────────────────

async function createPunctualEvent(
  formData: FormData,
  familyId: string,
  redirectTo: string,
  targetUserId: string | undefined,
): Promise<EventFormState | never> {
  const parsed = createPunctualEventSchema.safeParse({
    date: formData.get("date")?.toString(),
    description: formData.get("description")?.toString(),
    endTime: formData.get("endTime")?.toString() ?? undefined,
    startTime: formData.get("startTime")?.toString() ?? undefined,
    title: formData.get("title")?.toString(),
    category: formData.get("category")?.toString() || undefined,
    shiftType: formData.get("shiftType")?.toString() || undefined,
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
        category: fieldErrors.category?.[0],
        shiftType: fieldErrors.shiftType?.[0],
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
      message: "No tienes permiso para crear eventos en nombre de ese usuario.",
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
    category: parsed.data.category,
    shiftType: toOptionalString(parsed.data.shiftType),
  });

  if (!result.success) {
    return { message: buildErrorMessage(result.error.code), success: false };
  }

  await dispatchFamilyNotification(
    user.id,
    familyId,
    parsed.data.title,
    "created",
    parsed.data.date,
  );

  revalidatePath("/calendar");
  redirect(redirectTo);
}

async function createRecurringEvent(
  formData: FormData,
  familyId: string,
  redirectTo: string,
  targetUserId: string | undefined,
): Promise<EventFormState | never> {
  const parsed = createRecurringEventSchema.safeParse({
    category: formData.get("category")?.toString(),
    description: formData.get("description")?.toString(),
    endDate: formData.get("endDate")?.toString(),
    endTime: formData.get("endTime")?.toString() ?? undefined,
    frequencyInterval: formData.get("frequencyInterval")?.toString(),
    frequencyUnit: formData.get("frequencyUnit")?.toString(),
    shiftType: formData.get("shiftType")?.toString() || undefined,
    startDate: formData.get("startDate")?.toString(),
    startTime: formData.get("startTime")?.toString() ?? undefined,
    title: formData.get("title")?.toString(),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: {
        category: fieldErrors.category?.[0],
        description: fieldErrors.description?.[0],
        endDate: fieldErrors.endDate?.[0],
        endTime: fieldErrors.endTime?.[0],
        frequencyInterval: fieldErrors.frequencyInterval?.[0],
        frequencyUnit: fieldErrors.frequencyUnit?.[0],
        shiftType: fieldErrors.shiftType?.[0],
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
      message: "No tienes permiso para crear eventos en nombre de ese usuario.",
      success: false,
    };
  }

  const useCase = new CreateEvent(eventRepository, familyRepository);
  const result = await useCase.execute({
    category: parsed.data.category,
    createdBy,
    description: parsed.data.description,
    endDate: toOptionalDate(parsed.data.endDate),
    endTime: toOptionalString(parsed.data.endTime),
    eventType: "recurring",
    familyId,
    frequencyInterval: parsed.data.frequencyInterval,
    frequencyUnit: parsed.data.frequencyUnit,
    shiftType: toOptionalString(parsed.data.shiftType),
    startDate: toDate(parsed.data.startDate),
    startTime: toOptionalString(parsed.data.startTime),
    title: parsed.data.title,
  });

  if (!result.success) {
    return { message: buildErrorMessage(result.error.code), success: false };
  }

  await dispatchFamilyNotification(
    user.id,
    familyId,
    parsed.data.title,
    "created",
  );

  revalidatePath("/calendar");
  redirect(redirectTo);
}

// ─── Edit-event branch helpers ────────────────────────────────────────────────

type EventSummary = {
  familyId: string;
  createdBy: string;
  title: string;
} | null;

async function handleEditPunctual(
  formData: FormData,
  eventId: string,
  scope: "all" | "single" | undefined,
  occurrenceDateRaw: string | undefined,
  redirectTo: string,
  actorId: string,
  event: EventSummary,
  requestedBy: string,
): Promise<EventFormState | never> {
  const { eventRepository } = await createServerEventDependencies();
  const useCase = new EditEvent(eventRepository);

  const parsed = editPunctualEventSchema.safeParse({
    eventId,
    scope,
    occurrenceDate: occurrenceDateRaw,
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    date: formData.get("date")?.toString(),
    startTime: formData.get("startTime")?.toString() ?? undefined,
    endTime: formData.get("endTime")?.toString() ?? undefined,
    category: formData.get("category")?.toString() || undefined,
    shiftType: formData.get("shiftType")?.toString() || undefined,
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
        category: fieldErrors.category?.[0],
        shiftType: fieldErrors.shiftType?.[0],
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
    category: (parsed.data.category || undefined) ?? null,
    shiftType: (parsed.data.shiftType || undefined) ?? null,
  });

  if (!result.success) {
    return { success: false, message: buildErrorMessage(result.error.code) };
  }

  if (event?.familyId) {
    await dispatchFamilyNotification(
      actorId,
      event.familyId,
      parsed.data.title,
      "updated",
      parsed.data.date,
    );
  }

  revalidatePath("/calendar");
  redirect(redirectTo);
}

async function handleEditRecurring(
  formData: FormData,
  eventId: string,
  scope: "all" | "single" | undefined,
  occurrenceDateRaw: string | undefined,
  redirectTo: string,
  actorId: string,
  event: EventSummary,
  requestedBy: string,
): Promise<EventFormState | never> {
  const { eventRepository } = await createServerEventDependencies();
  const useCase = new EditEvent(eventRepository);

  const parsed = editRecurringEventSchema.safeParse({
    eventId,
    scope,
    occurrenceDate: occurrenceDateRaw ?? undefined,
    newDate: formData.get("newDate")?.toString() ?? undefined,
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    startDate: formData.get("startDate")?.toString() ?? undefined,
    endDate: formData.get("endDate")?.toString() ?? undefined,
    frequencyUnit: formData.get("frequencyUnit")?.toString() ?? undefined,
    frequencyInterval:
      formData.get("frequencyInterval")?.toString() ?? undefined,
    category: formData.get("category")?.toString() || undefined,
    shiftType: formData.get("shiftType")?.toString() || undefined,
    startTime: formData.get("startTime")?.toString() || undefined,
    endTime: formData.get("endTime")?.toString() || undefined,
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
        shiftType: fieldErrors.shiftType?.[0],
        startTime: fieldErrors.startTime?.[0],
        endTime: fieldErrors.endTime?.[0],
      },
    };
  }

  if (parsed.data.scope === "single") {
    return handleEditRecurringSingle(
      formData,
      eventId,
      occurrenceDateRaw,
      redirectTo,
      actorId,
      event,
      requestedBy,
      parsed.data,
      useCase,
    );
  }

  return handleEditRecurringAll(
    formData,
    eventId,
    redirectTo,
    actorId,
    event,
    requestedBy,
    parsed.data,
    useCase,
    eventRepository,
  );
}

async function handleEditRecurringSingle(
  _formData: FormData,
  eventId: string,
  occurrenceDateRaw: string | undefined,
  redirectTo: string,
  actorId: string,
  event: EventSummary,
  requestedBy: string,
  parsedData: {
    title: string;
    description?: string;
    newDate?: string;
    startTime?: string;
    endTime?: string;
  },
  useCase: EditEvent,
): Promise<EventFormState | never> {
  if (!occurrenceDateRaw) {
    return { success: false, message: "Selecciona la fecha de la ocurrencia." };
  }

  const occurrenceDate = toDate(occurrenceDateRaw);
  const newDateRaw = parsedData.newDate;
  const result = await useCase.execute({
    scope: "single",
    eventId,
    requestedBy,
    occurrenceDate,
    title: parsedData.title,
    description: parsedData.description ?? null,
    newDate: newDateRaw ? toDate(newDateRaw) : undefined,
    startTime: toOptionalString(parsedData.startTime) ?? null,
    endTime: toOptionalString(parsedData.endTime) ?? null,
  });

  if (!result.success) {
    return { success: false, message: buildErrorMessage(result.error.code) };
  }

  if (event?.familyId) {
    await dispatchFamilyNotification(
      actorId,
      event.familyId,
      parsedData.title,
      "updated",
      occurrenceDateRaw,
    );
  }

  revalidatePath("/calendar");
  redirect(redirectTo);
}

async function handleEditRecurringAll(
  formData: FormData,
  eventId: string,
  redirectTo: string,
  actorId: string,
  event: EventSummary,
  requestedBy: string,
  parsedData: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    frequencyUnit?: "daily" | "weekly" | "annual";
    frequencyInterval?: number;
    category?: EventCategory;
    shiftType?: string;
    startTime?: string;
    endTime?: string;
  },
  useCase: EditEvent,
  eventRepository: Awaited<
    ReturnType<typeof createServerEventDependencies>
  >["eventRepository"],
): Promise<EventFormState | never> {
  const deleteExceptions =
    formData.get("deleteExceptions")?.toString() === "true";

  const result = await useCase.execute({
    scope: "all",
    eventId,
    requestedBy,
    title: parsedData.title,
    description: parsedData.description ?? null,
    startDate: parsedData.startDate ? toDate(parsedData.startDate) : undefined,
    endDate: parsedData.endDate ? toDate(parsedData.endDate) : undefined,
    frequencyUnit: parsedData.frequencyUnit,
    frequencyInterval: parsedData.frequencyInterval,
    category: parsedData.category ?? undefined,
    shiftType: toOptionalString(parsedData.shiftType) ?? null,
    startTime: toOptionalString(parsedData.startTime) ?? null,
    endTime: toOptionalString(parsedData.endTime) ?? null,
  });

  if (!result.success) {
    return { success: false, message: buildErrorMessage(result.error.code) };
  }

  if (deleteExceptions) {
    await eventRepository.deleteExceptionsByEventId(eventId);
  }

  if (event?.familyId) {
    await dispatchFamilyNotification(
      actorId,
      event.familyId,
      parsedData.title,
      "updated",
    );
  }

  revalidatePath("/calendar");
  redirect(redirectTo);
}

// ─── Exported server actions ──────────────────────────────────────────────────

export async function createEventAction(
  _previousState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  // Part of the useActionState API contract, but unused because success redirects.

  const eventType = formData.get("eventType")?.toString();
  const familyId = formData.get("familyId")?.toString();
  const targetUserId = formData.get("targetUserId")?.toString() || undefined;
  const redirectTo = sanitizeRedirectPath(
    formData.get("redirectTo")?.toString(),
  );

  if (!familyId) {
    return { message: "No se encontró la familia activa.", success: false };
  }

  if (eventType === "punctual") {
    return createPunctualEvent(formData, familyId, redirectTo, targetUserId);
  }

  if (eventType === "recurring") {
    return createRecurringEvent(formData, familyId, redirectTo, targetUserId);
  }

  return { message: "Tipo de evento no reconocido.", success: false };
}

export async function editEventAction(
  _previousState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
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

  // Resolve the effective requestedBy to support delegation.
  const event = await eventRepository.findById(eventId);
  const requestedBy = event
    ? await resolveRequestedBy(user.id, event.createdBy, () =>
        userRepository.findDelegatedUsers(user.id),
      )
    : user.id;

  if (eventType === "punctual") {
    return handleEditPunctual(
      formData,
      eventId,
      scope,
      occurrenceDateRaw,
      redirectTo,
      user.id,
      event,
      requestedBy,
    );
  }

  if (eventType === "recurring") {
    return handleEditRecurring(
      formData,
      eventId,
      scope,
      occurrenceDateRaw,
      redirectTo,
      user.id,
      event,
      requestedBy,
    );
  }

  return { success: false, message: "Tipo de evento no reconocido." };
}

export async function deleteEventAction(
  _previousState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
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

  if (event?.familyId) {
    await dispatchFamilyNotification(
      user.id,
      event.familyId,
      event.title,
      "deleted",
      occurrenceDateRaw,
    );
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
