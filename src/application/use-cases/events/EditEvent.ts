import { randomUUID } from "node:crypto";
import {
  EventException,
  type EventExceptionOverrideData,
} from "@/domain/entities/EventException";
import { type Event } from "@/domain/entities/Event";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import {
  RecurringEvent,
  type EventCategory,
} from "@/domain/entities/RecurringEvent";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

export type EditEventInput =
  | {
      scope: "all";
      eventId: string;
      requestedBy: string;
      title?: string;
      description?: string | null;
      date?: Date;
      startDate?: Date;
      endDate?: Date | null;
      frequencyUnit?: "daily" | "weekly" | "annual";
      frequencyInterval?: number;
      category?: EventCategory | null;
      shiftType?: string | null;
      startTime?: string | null;
      endTime?: string | null;
    }
  | {
      scope: "single";
      eventId: string;
      requestedBy: string;
      occurrenceDate: Date;
      title?: string;
      description?: string | null;
      newDate?: Date;
      startTime?: string | null;
      endTime?: string | null;
    };

export type EditEventResult =
  | { success: true }
  | {
      success: false;
      error: {
        code:
          | "EVENT_NOT_FOUND"
          | "FORBIDDEN"
          | "INVALID_SCOPE"
          | "INVALID_EVENT";
        message: string;
      };
    };

// ─── Pure helpers for building updated domain objects ─────────────────────────

function resolveShiftType(
  inputShiftType: string | null | undefined,
  existingShiftType: ReturnType<typeof ShiftType.create> | null,
): ReturnType<typeof ShiftType.create> | null {
  if (inputShiftType === undefined) return existingShiftType;
  return inputShiftType ? ShiftType.create(inputShiftType) : null;
}

function buildUpdatedPunctual(
  event: PunctualEvent,
  input: Extract<EditEventInput, { scope: "all" }>,
): PunctualEvent {
  return new PunctualEvent({
    id: event.id,
    familyId: event.familyId,
    createdBy: event.createdBy,
    title: input.title ?? event.title,
    description:
      input.description !== undefined ? input.description : event.description,
    date: input.date ?? event.date,
    startTime:
      input.startTime !== undefined ? input.startTime : event.startTime,
    endTime: input.endTime !== undefined ? input.endTime : event.endTime,
    category: input.category !== undefined ? input.category : event.category,
    shiftType: resolveShiftType(input.shiftType, event.shiftType),
    createdAt: event.createdAt,
    updatedAt: new Date(),
  });
}

function buildUpdatedRecurring(
  event: RecurringEvent,
  input: Extract<EditEventInput, { scope: "all" }>,
): RecurringEvent {
  const hasFrequencyChange =
    input.frequencyUnit !== undefined || input.frequencyInterval !== undefined;

  return new RecurringEvent({
    id: event.id,
    familyId: event.familyId,
    createdBy: event.createdBy,
    title: input.title ?? event.title,
    description:
      input.description !== undefined ? input.description : event.description,
    category: input.category != null ? input.category : event.category,
    startDate: input.startDate ?? event.startDate,
    endDate: input.endDate !== undefined ? input.endDate : event.endDate,
    frequency: hasFrequencyChange
      ? EventFrequency.create(
          input.frequencyUnit ?? event.frequency.unit,
          input.frequencyInterval ?? event.frequency.interval,
        )
      : event.frequency,
    shiftType: resolveShiftType(input.shiftType, event.shiftType),
    startTime:
      input.startTime !== undefined ? input.startTime : event.startTime,
    endTime: input.endTime !== undefined ? input.endTime : event.endTime,
    createdAt: event.createdAt,
    updatedAt: new Date(),
  });
}

function buildExceptionOverride(
  input: Extract<EditEventInput, { scope: "single" }>,
): EventExceptionOverrideData {
  const overrideData: EventExceptionOverrideData = {};
  if (input.title !== undefined) overrideData.title = input.title;
  if (input.description !== undefined)
    overrideData.description = input.description;
  if (input.startTime !== undefined) overrideData.startTime = input.startTime;
  if (input.endTime !== undefined) overrideData.endTime = input.endTime;
  if (input.newDate !== undefined)
    overrideData.newDate = input.newDate.toISOString().slice(0, 10);
  return overrideData;
}

// ─── Use-case class ───────────────────────────────────────────────────────────

export class EditEvent {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: EditEventInput): Promise<EditEventResult> {
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      return {
        success: false,
        error: { code: "EVENT_NOT_FOUND", message: "Event not found" },
      };
    }

    if (event.createdBy !== input.requestedBy) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "You do not own this event" },
      };
    }

    try {
      if (input.scope === "all") {
        return await this.editAllScope(event, input);
      }

      return await this.editSingleScope(event, input);
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: { code: "INVALID_EVENT", message: error.message },
        };
      }
      throw error;
    }
  }

  private async editAllScope(
    event: Event,
    input: Extract<EditEventInput, { scope: "all" }>,
  ): Promise<EditEventResult> {
    if (event.type === "punctual") {
      const updated = buildUpdatedPunctual(event as PunctualEvent, input);
      await this.eventRepository.save(updated);
    } else {
      const updated = buildUpdatedRecurring(event as RecurringEvent, input);
      await this.eventRepository.save(updated);
    }
    return { success: true };
  }

  private async editSingleScope(
    event: Event,
    input: Extract<EditEventInput, { scope: "single" }>,
  ): Promise<EditEventResult> {
    if (event.type === "punctual") {
      return {
        success: false,
        error: {
          code: "INVALID_SCOPE",
          message: "Cannot edit a single occurrence of a punctual event",
        },
      };
    }

    const overrideData = buildExceptionOverride(input);
    const exception = new EventException({
      id: randomUUID(),
      eventId: event.id,
      exceptionDate: input.occurrenceDate,
      isDeleted: false,
      overrideData: Object.keys(overrideData).length > 0 ? overrideData : null,
    });

    await this.eventRepository.saveException(exception);
    return { success: true };
  }
}
