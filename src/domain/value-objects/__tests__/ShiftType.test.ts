import { describe, expect, it } from "vitest";
import { ShiftType } from "@/domain/value-objects/ShiftType";

describe("ShiftType", () => {
  it("creates a shift type from a supported value and maps it to a tone", () => {
    const shiftType = ShiftType.create("Morning");

    expect(shiftType.value).toBe("morning");
    expect(shiftType.getTone()).toBe("lightest");
  });

  it("rejects unsupported shift types", () => {
    expect(() => ShiftType.create("late")).toThrow(
      "Shift type must be one of: morning, day, afternoon, night",
    );
  });
});
