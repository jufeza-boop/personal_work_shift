import { describe, expect, it } from "vitest";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";

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
});
