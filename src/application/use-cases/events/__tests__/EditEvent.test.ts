import { describe, expect, it, vi } from "vitest";
import { EditEvent } from "@/application/use-cases/events/EditEvent";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

function createEventRepository(): IEventRepository {
  return {
    delete: vi.fn(),
    findByFamilyId: vi.fn(),
    findById: vi.fn(),
    findExceptionsByEventIds: vi.fn(),
    save: vi.fn(),
    saveException: vi.fn(),
  };
}

function makePunctualEvent(createdBy = "user-1"): PunctualEvent {
  return new PunctualEvent({
    id: "event-1",
    familyId: "family-1",
    createdBy,
    title: "Original title",
    date: new Date("2025-07-01T00:00:00.000Z"),
    startTime: null,
    endTime: null,
  });
}

function makeRecurringEvent(createdBy = "user-1"): RecurringEvent {
  return new RecurringEvent({
    id: "event-2",
    familyId: "family-1",
    createdBy,
    title: "Morning shift",
    category: "work",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    frequency: EventFrequency.create("weekly", 1),
    shiftType: ShiftType.create("morning"),
    endDate: null,
    startTime: null,
    endTime: null,
  });
}

describe("EditEvent", () => {
  it("returns EVENT_NOT_FOUND when event not found", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(null);

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "nonexistent",
      requestedBy: "user-1",
      title: "New title",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("EVENT_NOT_FOUND");
  });

  it("returns FORBIDDEN when requestedBy !== createdBy", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(
      makePunctualEvent("user-1"),
    );

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-1",
      requestedBy: "other-user",
      title: "New title",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("FORBIDDEN");
    expect(eventRepository.save).not.toHaveBeenCalled();
  });

  it("scope 'all' on punctual: updates and saves event", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makePunctualEvent());
    vi.mocked(eventRepository.save).mockResolvedValue(undefined);

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-1",
      requestedBy: "user-1",
      title: "Updated title",
      date: new Date("2025-07-15T00:00:00.000Z"),
    });

    expect(result.success).toBe(true);
    expect(eventRepository.save).toHaveBeenCalledTimes(1);
    const saved = vi.mocked(eventRepository.save).mock
      .calls[0][0] as PunctualEvent;
    expect(saved.title).toBe("Updated title");
    expect(saved.date).toEqual(new Date("2025-07-15T00:00:00.000Z"));
  });

  it("scope 'all' on recurring: updates and saves event", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makeRecurringEvent());
    vi.mocked(eventRepository.save).mockResolvedValue(undefined);

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-2",
      requestedBy: "user-1",
      title: "Afternoon shift",
      shiftType: "afternoon",
    });

    expect(result.success).toBe(true);
    expect(eventRepository.save).toHaveBeenCalledTimes(1);
    const saved = vi.mocked(eventRepository.save).mock
      .calls[0][0] as RecurringEvent;
    expect(saved.title).toBe("Afternoon shift");
    expect(saved.shiftType?.value).toBe("afternoon");
  });

  it("scope 'single' on punctual: returns INVALID_SCOPE", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makePunctualEvent());

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "single",
      eventId: "event-1",
      requestedBy: "user-1",
      occurrenceDate: new Date("2025-07-01"),
      title: "Override",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("INVALID_SCOPE");
    expect(eventRepository.saveException).not.toHaveBeenCalled();
  });

  it("scope 'single' on recurring: saves an EventException", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makeRecurringEvent());
    vi.mocked(eventRepository.saveException).mockResolvedValue(undefined);

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "single",
      eventId: "event-2",
      requestedBy: "user-1",
      occurrenceDate: new Date("2025-07-07T00:00:00.000Z"),
      title: "Override title",
    });

    expect(result.success).toBe(true);
    expect(eventRepository.saveException).toHaveBeenCalledTimes(1);
    const exception = vi.mocked(eventRepository.saveException).mock.calls[0][0];
    expect(exception.eventId).toBe("event-2");
    expect(exception.isDeleted).toBe(false);
    expect(exception.overrideData?.title).toBe("Override title");
  });

  it("scope 'all' with validation error: returns INVALID_EVENT", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makePunctualEvent());

    const useCase = new EditEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-1",
      requestedBy: "user-1",
      title: "  ",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("INVALID_EVENT");
    expect(eventRepository.save).not.toHaveBeenCalled();
  });
});
