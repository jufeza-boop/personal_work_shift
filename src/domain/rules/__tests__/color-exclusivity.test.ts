import { describe, expect, it } from "vitest";
import {
  assertColorPaletteExclusive,
  isColorPaletteExclusive,
} from "@/domain/rules/color-exclusivity";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

describe("color exclusivity rule", () => {
  it("returns true when the palette is still available", () => {
    expect(
      isColorPaletteExclusive(ColorPalette.create("sky"), [
        ColorPalette.create("rose"),
        ColorPalette.create("teal"),
      ]),
    ).toBe(true);
  });

  it("throws when the palette is already assigned", () => {
    expect(() =>
      assertColorPaletteExclusive(ColorPalette.create("sky"), [
        ColorPalette.create("sky"),
      ]),
    ).toThrow("Color palette sky is already assigned in this family");
  });
});
