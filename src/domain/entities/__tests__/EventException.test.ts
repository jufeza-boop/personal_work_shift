import { describe, expect, it } from "vitest";
import { EventException } from "@/domain/entities/EventException";

describe("EventException", () => {
  it("creates a valid EventException", () => {
    const now = new Date("2025-07-10T00:00:00.000Z");
    const exception = new EventException({
      id: "exc-1",
      eventId: "event-1",
      exceptionDate: now,
      isDeleted: false,
      overrideData: null,
    });

    expect(exception.id).toBe("exc-1");
    expect(exception.eventId).toBe("event-1");
    expect(exception.exceptionDate).toBe(now);
    expect(exception.isDeleted).toBe(false);
    expect(exception.overrideData).toBeNull();
    expect(exception.createdAt).toBeInstanceOf(Date);
  });

  it("rejects empty id", () => {
    expect(
      () =>
        new EventException({
          id: "  ",
          eventId: "event-1",
          exceptionDate: new Date("2025-07-10"),
          isDeleted: false,
          overrideData: null,
        }),
    ).toThrow("EventException id cannot be empty");
  });

  it("rejects empty eventId", () => {
    expect(
      () =>
        new EventException({
          id: "exc-1",
          eventId: "",
          exceptionDate: new Date("2025-07-10"),
          isDeleted: false,
          overrideData: null,
        }),
    ).toThrow("EventException eventId cannot be empty");
  });

  it("rejects invalid date", () => {
    expect(
      () =>
        new EventException({
          id: "exc-1",
          eventId: "event-1",
          exceptionDate: new Date("not-a-date"),
          isDeleted: false,
          overrideData: null,
        }),
    ).toThrow("EventException exceptionDate must be a valid date");
  });

  it("creates with isDeleted=true", () => {
    const exception = new EventException({
      id: "exc-2",
      eventId: "event-1",
      exceptionDate: new Date("2025-07-10"),
      isDeleted: true,
      overrideData: null,
    });

    expect(exception.isDeleted).toBe(true);
  });

  it("creates with overrideData", () => {
    const overrideData = {
      title: "Override title",
      description: "Override description",
      startTime: "10:00",
      endTime: "11:00",
    };
    const exception = new EventException({
      id: "exc-3",
      eventId: "event-1",
      exceptionDate: new Date("2025-07-10"),
      isDeleted: false,
      overrideData,
    });

    expect(exception.overrideData).toEqual(overrideData);
  });
});
