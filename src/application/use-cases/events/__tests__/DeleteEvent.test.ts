import { describe, expect, it, vi } from "vitest";
import { DeleteEvent } from "@/application/use-cases/events/DeleteEvent";
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
    save: vi.fn(),
    saveException: vi.fn(),
  };
}

function makePunctualEvent(createdBy = "user-1"): PunctualEvent {
  return new PunctualEvent({
    id: "event-1",
    familyId: "family-1",
    createdBy,
    title: "Dentist",
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

describe("DeleteEvent", () => {
  it("returns EVENT_NOT_FOUND when event not found", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(null);

    const useCase = new DeleteEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "nonexistent",
      requestedBy: "user-1",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("EVENT_NOT_FOUND");
    expect(eventRepository.delete).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN when requestedBy !== createdBy", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(
      makePunctualEvent("user-1"),
    );

    const useCase = new DeleteEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-1",
      requestedBy: "other-user",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("FORBIDDEN");
    expect(eventRepository.delete).not.toHaveBeenCalled();
  });

  it("scope 'all': calls eventRepository.delete", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makePunctualEvent());
    vi.mocked(eventRepository.delete).mockResolvedValue(undefined);

    const useCase = new DeleteEvent(eventRepository);
    const result = await useCase.execute({
      scope: "all",
      eventId: "event-1",
      requestedBy: "user-1",
    });

    expect(result.success).toBe(true);
    expect(eventRepository.delete).toHaveBeenCalledWith("event-1");
  });

  it("scope 'single' on punctual: returns INVALID_SCOPE", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makePunctualEvent());

    const useCase = new DeleteEvent(eventRepository);
    const result = await useCase.execute({
      scope: "single",
      eventId: "event-1",
      requestedBy: "user-1",
      occurrenceDate: new Date("2025-07-01"),
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("INVALID_SCOPE");
    expect(eventRepository.saveException).not.toHaveBeenCalled();
  });

  it("scope 'single' on recurring: calls saveException with isDeleted=true", async () => {
    const eventRepository = createEventRepository();
    vi.mocked(eventRepository.findById).mockResolvedValue(makeRecurringEvent());
    vi.mocked(eventRepository.saveException).mockResolvedValue(undefined);

    const useCase = new DeleteEvent(eventRepository);
    const result = await useCase.execute({
      scope: "single",
      eventId: "event-2",
      requestedBy: "user-1",
      occurrenceDate: new Date("2025-07-07T00:00:00.000Z"),
    });

    expect(result.success).toBe(true);
    expect(eventRepository.saveException).toHaveBeenCalledTimes(1);
    const exception = vi.mocked(eventRepository.saveException).mock.calls[0][0];
    expect(exception.eventId).toBe("event-2");
    expect(exception.isDeleted).toBe(true);
    expect(exception.overrideData).toBeNull();
  });
});
