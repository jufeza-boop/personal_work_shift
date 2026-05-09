import { describe, expect, it } from "vitest";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

describe("RecurringEvent", () => {
  it("requires a shift type for work or studies events", () => {
    const event = new RecurringEvent({
      id: "event-1",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Morning shift",
      category: "work",
      startDate: new Date("2026-04-10"),
      frequency: EventFrequency.create("weekly", 1),
      shiftType: ShiftType.create("morning"),
    });

    expect(event.type).toBe("recurring");
    expect(event.category).toBe("work");
    expect(event.shiftType?.value).toBe("morning");
  });

  it("rejects work or studies events without a shift type", () => {
    expect(
      () =>
        new RecurringEvent({
          id: "event-2",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Study block",
          category: "studies",
          startDate: new Date("2026-04-10"),
          frequency: EventFrequency.create("daily", 1),
        }),
    ).toThrow("Recurring work or studies events require a shift type");
  });

  it("rejects shift types for recurring other events", () => {
    expect(
      () =>
        new RecurringEvent({
          id: "event-3",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Gym",
          category: "other",
          startDate: new Date("2026-04-10"),
          frequency: EventFrequency.create("annual", 1),
          shiftType: ShiftType.create("night"),
        }),
    ).toThrow("Recurring other/vacations events cannot define a shift type");
  });

  it("creates a recurring vacations event without a shift type", () => {
    const event = new RecurringEvent({
      id: "event-4",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Annual vacation",
      category: "vacations",
      startDate: new Date("2026-07-01"),
      frequency: EventFrequency.create("annual", 1),
    });

    expect(event.category).toBe("vacations");
    expect(event.shiftType).toBeNull();
  });

  it("rejects shift types for recurring vacations events", () => {
    expect(
      () =>
        new RecurringEvent({
          id: "event-5",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Summer holiday",
          category: "vacations",
          startDate: new Date("2026-07-01"),
          frequency: EventFrequency.create("annual", 1),
          shiftType: ShiftType.create("morning"),
        }),
    ).toThrow("Recurring other/vacations events cannot define a shift type");
  });
});

