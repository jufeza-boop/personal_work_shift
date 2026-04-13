import { randomUUID } from "node:crypto";
import { EventException } from "@/domain/entities/EventException";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";

export type DeleteEventInput =
  | { scope: "all"; eventId: string; requestedBy: string }
  | {
      scope: "single";
      eventId: string;
      requestedBy: string;
      occurrenceDate: Date;
    };

export type DeleteEventResult =
  | { success: true }
  | {
      success: false;
      error: {
        code: "EVENT_NOT_FOUND" | "FORBIDDEN" | "INVALID_SCOPE";
        message: string;
      };
    };

export class DeleteEvent {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: DeleteEventInput): Promise<DeleteEventResult> {
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

    if (input.scope === "all") {
      await this.eventRepository.delete(input.eventId);
      return { success: true };
    }

    // scope === "single"
    if (event.type === "punctual") {
      return {
        success: false,
        error: {
          code: "INVALID_SCOPE",
          message: "Cannot delete a single occurrence of a punctual event",
        },
      };
    }

    const exception = new EventException({
      id: randomUUID(),
      eventId: event.id,
      exceptionDate: input.occurrenceDate,
      isDeleted: true,
      overrideData: null,
    });

    await this.eventRepository.saveException(exception);
    return { success: true };
  }
}
