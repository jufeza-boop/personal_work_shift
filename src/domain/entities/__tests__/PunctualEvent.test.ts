import { describe, expect, it } from "vitest";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { ShiftType } from "@/domain/value-objects/ShiftType";

describe("PunctualEvent", () => {
  it("creates a one-time event with an optional time range", () => {
    const event = new PunctualEvent({
      id: "event-1",
      familyId: "family-1",
      createdBy: "user-1",
      title: " Dentist ",
      date: new Date("2026-04-10"),
      startTime: "09:00",
      endTime: "10:00",
    });

    expect(event.type).toBe("punctual");
    expect(event.title).toBe("Dentist");
    expect(event.startTime).toBe("09:00");
    expect(event.endTime).toBe("10:00");
    expect(event.category).toBeNull();
    expect(event.shiftType).toBeNull();
  });

  it("rejects an end time earlier than the start time", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-2",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Appointment",
          date: new Date("2026-04-10"),
          startTime: "10:00",
          endTime: "09:00",
        }),
    ).toThrow("Event end time must be later than the start time");
  });

  it("creates a punctual work event with a shift type", () => {
    const event = new PunctualEvent({
      id: "event-3",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Morning shift",
      date: new Date("2026-04-10"),
      category: "work",
      shiftType: ShiftType.create("morning"),
    });

    expect(event.category).toBe("work");
    expect(event.shiftType?.value).toBe("morning");
  });

  it("creates a punctual studies event with a shift type", () => {
    const event = new PunctualEvent({
      id: "event-4",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Study session",
      date: new Date("2026-04-10"),
      category: "studies",
      shiftType: ShiftType.create("day"),
    });

    expect(event.category).toBe("studies");
    expect(event.shiftType?.value).toBe("day");
  });

  it("creates a punctual vacations event without a shift type", () => {
    const event = new PunctualEvent({
      id: "event-5",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Beach day",
      date: new Date("2026-08-01"),
      category: "vacations",
    });

    expect(event.category).toBe("vacations");
    expect(event.shiftType).toBeNull();
  });

  it("creates a punctual other event without a shift type", () => {
    const event = new PunctualEvent({
      id: "event-6",
      familyId: "family-1",
      createdBy: "user-1",
      title: "Gym",
      date: new Date("2026-04-10"),
      category: "other",
    });

    expect(event.category).toBe("other");
    expect(event.shiftType).toBeNull();
  });

  it("rejects work events without a shift type", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-7",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Shift",
          date: new Date("2026-04-10"),
          category: "work",
        }),
    ).toThrow("Punctual work or studies events require a shift type");
  });

  it("rejects studies events without a shift type", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-8",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Class",
          date: new Date("2026-04-10"),
          category: "studies",
        }),
    ).toThrow("Punctual work or studies events require a shift type");
  });

  it("rejects vacations events with a shift type", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-9",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Holiday",
          date: new Date("2026-08-01"),
          category: "vacations",
          shiftType: ShiftType.create("morning"),
        }),
    ).toThrow("Punctual other/vacations events cannot define a shift type");
  });

  it("rejects other events with a shift type", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-10",
          familyId: "family-1",
          createdBy: "user-1",
          title: "Random",
          date: new Date("2026-04-10"),
          category: "other",
          shiftType: ShiftType.create("night"),
        }),
    ).toThrow("Punctual other/vacations events cannot define a shift type");
  });

  it("rejects a shift type when category is null", () => {
    expect(
      () =>
        new PunctualEvent({
          id: "event-11",
          familyId: "family-1",
          createdBy: "user-1",
          title: "No category",
          date: new Date("2026-04-10"),
          shiftType: ShiftType.create("morning"),
        }),
    ).toThrow("Punctual event shift type requires a category");
  });
});
