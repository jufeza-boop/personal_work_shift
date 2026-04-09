import { describe, expect, it } from "vitest";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import { ShiftType } from "@/domain/value-objects/ShiftType";

describe("ColorPalette", () => {
  it("provides a predefined pastel palette with tones for every shift", () => {
    const palette = ColorPalette.create("sky");

    expect(ColorPalette.availablePalettes()).toHaveLength(8);
    expect(palette.name).toBe("sky");
    expect(palette.getToneFor(ShiftType.create("morning"))).toBe("#E0F2FE");
    expect(palette.getToneFor(ShiftType.create("night"))).toBe("#0284C7");
  });

  it("rejects unknown palette names", () => {
    expect(() => ColorPalette.create("neon")).toThrow(
      "Color palette must be one of: sky, rose, violet, emerald, amber, coral, slate, teal",
    );
  });
});
