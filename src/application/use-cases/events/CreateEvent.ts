import { randomUUID } from "node:crypto";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import type { PunctualEvent as PunctualEventType } from "@/domain/entities/PunctualEvent";
import type { RecurringEvent as RecurringEventType } from "@/domain/entities/RecurringEvent";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

interface CreatePunctualEventInput {
  eventType: "punctual";
  familyId: string;
  createdBy: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
}

interface CreateRecurringEventInput {
  eventType: "recurring";
  familyId: string;
  createdBy: string;
  title: string;
  description?: string;
  category: "work" | "studies" | "other";
  startDate: Date;
  frequencyUnit: "daily" | "weekly" | "annual";
  frequencyInterval: number;
  shiftType?: string;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
}

export type CreateEventInput =
  | CreatePunctualEventInput
  | CreateRecurringEventInput;

export type CreateEventResult =
  | { success: true; data: { event: PunctualEventType | RecurringEventType } }
  | {
      success: false;
      error: {
        code:
          | "FAMILY_NOT_FOUND"
          | "NOT_A_FAMILY_MEMBER"
          | "INVALID_EVENT"
          | "FORBIDDEN";
        message: string;
      };
    };

export class CreateEvent {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(input: CreateEventInput): Promise<CreateEventResult> {
    const family = await this.familyRepository.findById(input.familyId);

    if (!family) {
      return {
        error: {
          code: "FAMILY_NOT_FOUND",
          message: "The specified family does not exist",
        },
        success: false,
      };
    }

    if (!family.hasMember(input.createdBy)) {
      return {
        error: {
          code: "NOT_A_FAMILY_MEMBER",
          message: "The event creator must be a member of the family",
        },
        success: false,
      };
    }

    try {
      if (input.eventType === "punctual") {
        const event = new PunctualEvent({
          createdBy: input.createdBy,
          date: input.date,
          description: input.description,
          endTime: input.endTime,
          familyId: input.familyId,
          id: randomUUID(),
          startTime: input.startTime,
          title: input.title,
        });

        await this.eventRepository.save(event);

        return { data: { event }, success: true };
      }

      const event = new RecurringEvent({
        category: input.category,
        createdBy: input.createdBy,
        description: input.description,
        endDate: input.endDate,
        endTime: input.endTime,
        familyId: input.familyId,
        frequency: EventFrequency.create(
          input.frequencyUnit,
          input.frequencyInterval,
        ),
        id: randomUUID(),
        shiftType: input.shiftType ? ShiftType.create(input.shiftType) : null,
        startDate: input.startDate,
        startTime: input.startTime,
        title: input.title,
      });

      await this.eventRepository.save(event);

      return { data: { event }, success: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          error: {
            code: "INVALID_EVENT",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
