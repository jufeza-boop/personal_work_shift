import { describe, expect, it } from "vitest";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";

describe("EventFrequency", () => {
  it("creates a recurring frequency with a positive interval", () => {
    const frequency = EventFrequency.create("weekly", 2);

    expect(frequency.unit).toBe("weekly");
    expect(frequency.interval).toBe(2);
  });

  it("rejects unsupported recurrence units", () => {
    expect(() => EventFrequency.create("monthly", 1)).toThrow(
      "Event frequency must be one of: daily, weekly, annual",
    );
  });

  it("rejects intervals smaller than one", () => {
    expect(() => EventFrequency.create("daily", 0)).toThrow(
      "Event frequency interval must be greater than zero",
    );
  });
});
