import { describe, expect, it } from "vitest";
import {
  getOccurrencesForMonth,
  getShiftColor,
  serializeEvent,
} from "@/application/services/calendarUtils";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

const BASE_PROPS = {
  createdBy: "user-1",
  familyId: "family-1",
  id: "evt-1",
  title: "Test event",
};

describe("serializeEvent", () => {
  it("serializes a PunctualEvent to a plain object", () => {
    const event = new PunctualEvent({
      ...BASE_PROPS,
      date: new Date("2026-06-15"),
    });
    const result = serializeEvent(event);

    expect(result.type).toBe("punctual");
    if (result.type !== "punctual") return;
    expect(result.id).toBe("evt-1");
    expect(result.date).toBe("2026-06-15");
    expect(result.createdBy).toBe("user-1");
  });

  it("serializes a RecurringEvent to a plain object", () => {
    const event = new RecurringEvent({
      ...BASE_PROPS,
      category: "work",
      frequency: EventFrequency.create("weekly", 1),
      shiftType: ShiftType.create("morning"),
      startDate: new Date("2026-06-01"),
    });
    const result = serializeEvent(event);

    expect(result.type).toBe("recurring");
    if (result.type !== "recurring") return;
    expect(result.startDate).toBe("2026-06-01");
    expect(result.shiftType).toBe("morning");
    expect(result.category).toBe("work");
  });

  it("throws for unknown event types", () => {
    const fakeEvent = { type: "unknown" };

    expect(() =>
      serializeEvent(fakeEvent as unknown as PunctualEvent),
    ).toThrow();
  });
});

describe("getOccurrencesForMonth", () => {
  it("returns a punctual event on the matching day", () => {
    const events = [
      {
        type: "punctual" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Doctor visit",
        date: "2026-04-10",
        startTime: null,
        endTime: null,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(1);
    expect(result[0]?.date).toBe("2026-04-10");
    expect(result[0]?.title).toBe("Doctor visit");
    expect(result[0]?.type).toBe("punctual");
  });

  it("excludes a punctual event outside the month", () => {
    const events = [
      {
        type: "punctual" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Outside event",
        date: "2026-05-01",
        startTime: null,
        endTime: null,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(0);
  });

  it("returns daily recurring event occurrences within the month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Daily standup",
        category: "work" as const,
        startDate: "2026-04-01",
        endDate: null,
        frequencyUnit: "daily" as const,
        frequencyInterval: 1,
        shiftType: "morning" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(30);
    expect(result[0]?.date).toBe("2026-04-01");
    expect(result[29]?.date).toBe("2026-04-30");
  });

  it("returns weekly recurring event occurrences within the month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Weekly meeting",
        category: "work" as const,
        startDate: "2026-04-06",
        endDate: null,
        frequencyUnit: "weekly" as const,
        frequencyInterval: 1,
        shiftType: "day" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(4);
    expect(result.map((o) => o.date)).toEqual([
      "2026-04-06",
      "2026-04-13",
      "2026-04-20",
      "2026-04-27",
    ]);
  });

  it("returns bi-weekly recurring event occurrences within the month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Bi-weekly shift",
        category: "work" as const,
        startDate: "2026-04-01",
        endDate: null,
        frequencyUnit: "weekly" as const,
        frequencyInterval: 2,
        shiftType: "night" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(3);
    expect(result.map((o) => o.date)).toEqual([
      "2026-04-01",
      "2026-04-15",
      "2026-04-29",
    ]);
  });

  it("returns annual recurring event occurrences in the matching month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Birthday",
        category: "other" as const,
        startDate: "2020-04-15",
        endDate: null,
        frequencyUnit: "annual" as const,
        frequencyInterval: 1,
        shiftType: null,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(1);
    expect(result[0]?.date).toBe("2026-04-15");
  });

  it("excludes an annual event in a different month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Anniversary",
        category: "other" as const,
        startDate: "2020-06-20",
        endDate: null,
        frequencyUnit: "annual" as const,
        frequencyInterval: 1,
        shiftType: null,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(0);
  });

  it("respects endDate and stops generating occurrences after it", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Limited shift",
        category: "work" as const,
        startDate: "2026-04-01",
        endDate: "2026-04-14",
        frequencyUnit: "daily" as const,
        frequencyInterval: 1,
        shiftType: "afternoon" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result).toHaveLength(14);
    expect(result[13]?.date).toBe("2026-04-14");
  });

  it("handles a recurring event that started before the month", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Old weekly",
        category: "work" as const,
        startDate: "2020-01-06",
        endDate: null,
        frequencyUnit: "weekly" as const,
        frequencyInterval: 1,
        shiftType: "morning" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    // April 6 2026 is a Monday; check that some Monday dates fall in April
    expect(result.length).toBeGreaterThan(0);
    result.forEach((o) => {
      expect(o.date.startsWith("2026-04")).toBe(true);
    });
  });

  it("returns shiftType and category on recurring occurrences", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Night shift",
        category: "work" as const,
        startDate: "2026-04-01",
        endDate: null,
        frequencyUnit: "weekly" as const,
        frequencyInterval: 1,
        shiftType: "night" as const,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result[0]?.shiftType).toBe("night");
    expect(result[0]?.category).toBe("work");
  });

  it("returns null shiftType and category=other for recurring other events", () => {
    const events = [
      {
        type: "recurring" as const,
        id: "e1",
        familyId: "f1",
        createdBy: "u1",
        title: "Yoga",
        category: "other" as const,
        startDate: "2026-04-01",
        endDate: null,
        frequencyUnit: "weekly" as const,
        frequencyInterval: 1,
        shiftType: null,
      },
    ];

    const result = getOccurrencesForMonth(events, 2026, 4);

    expect(result[0]?.shiftType).toBeNull();
    expect(result[0]?.category).toBe("other");
  });
});

describe("getShiftColor", () => {
  it("returns a color string for a valid palette and shift type", () => {
    const color = getShiftColor("sky", "morning");

    expect(typeof color).toBe("string");
    expect(color).not.toBeNull();
  });

  it("returns null when palette is null", () => {
    expect(getShiftColor(null, "morning")).toBeNull();
  });

  it("returns null when shiftType is null", () => {
    expect(getShiftColor("sky", null)).toBeNull();
  });

  it("returns null for invalid palette name", () => {
    expect(getShiftColor("invalid-palette", "morning")).toBeNull();
  });

  it("returns different colors for different shift types on the same palette", () => {
    const morning = getShiftColor("sky", "morning");
    const night = getShiftColor("sky", "night");

    expect(morning).not.toBe(night);
  });
});
