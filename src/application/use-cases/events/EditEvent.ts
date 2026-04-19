import { randomUUID } from "node:crypto";
import { EventException } from "@/domain/entities/EventException";
import type { EventExceptionOverrideData } from "@/domain/entities/EventException";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
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
        if (event.type === "punctual") {
          const punctual = event as PunctualEvent;
          const updated = new PunctualEvent({
            id: event.id,
            familyId: event.familyId,
            createdBy: event.createdBy,
            title: input.title ?? event.title,
            description:
              input.description !== undefined
                ? input.description
                : event.description,
            date: input.date ?? punctual.date,
            startTime:
              input.startTime !== undefined
                ? input.startTime
                : punctual.startTime,
            endTime:
              input.endTime !== undefined ? input.endTime : punctual.endTime,
            createdAt: event.createdAt,
            updatedAt: new Date(),
          });
          await this.eventRepository.save(updated);
        } else {
          const recurring = event as RecurringEvent;
          const updated = new RecurringEvent({
            id: event.id,
            familyId: event.familyId,
            createdBy: event.createdBy,
            title: input.title ?? event.title,
            description:
              input.description !== undefined
                ? input.description
                : event.description,
            category: recurring.category,
            startDate: input.startDate ?? recurring.startDate,
            endDate:
              input.endDate !== undefined ? input.endDate : recurring.endDate,
            frequency:
              input.frequencyUnit !== undefined ||
              input.frequencyInterval !== undefined
                ? EventFrequency.create(
                    input.frequencyUnit ?? recurring.frequency.unit,
                    input.frequencyInterval ?? recurring.frequency.interval,
                  )
                : recurring.frequency,
            shiftType:
              input.shiftType !== undefined
                ? input.shiftType
                  ? ShiftType.create(input.shiftType)
                  : null
                : recurring.shiftType,
            startTime:
              input.startTime !== undefined
                ? input.startTime
                : recurring.startTime,
            endTime:
              input.endTime !== undefined ? input.endTime : recurring.endTime,
            createdAt: event.createdAt,
            updatedAt: new Date(),
          });
          await this.eventRepository.save(updated);
        }
        return { success: true };
      }

      // scope === "single"
      if (event.type === "punctual") {
        return {
          success: false,
          error: {
            code: "INVALID_SCOPE",
            message: "Cannot edit a single occurrence of a punctual event",
          },
        };
      }

      const overrideData: EventExceptionOverrideData = {};
      if (input.title !== undefined) overrideData.title = input.title;
      if (input.description !== undefined)
        overrideData.description = input.description;
      if (input.startTime !== undefined)
        overrideData.startTime = input.startTime;
      if (input.endTime !== undefined) overrideData.endTime = input.endTime;
      if (input.newDate !== undefined)
        overrideData.newDate = input.newDate.toISOString().slice(0, 10);

      const exception = new EventException({
        id: randomUUID(),
        eventId: event.id,
        exceptionDate: input.occurrenceDate,
        isDeleted: false,
        overrideData:
          Object.keys(overrideData).length > 0 ? overrideData : null,
      });

      await this.eventRepository.saveException(exception);
      return { success: true };
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
}
