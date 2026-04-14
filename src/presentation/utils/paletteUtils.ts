import type { ShiftTypeValue } from "@/domain/value-objects/ShiftType";
import type { ColorPaletteName } from "@/domain/value-objects/ColorPalette";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import { ShiftType, SHIFT_TYPE_VALUES } from "@/domain/value-objects/ShiftType";

export type PaletteToneMap = Record<ShiftTypeValue, string>;

/**
 * Computes the shift-tone hex colors for a given palette name.
 * Derives values from the canonical domain `ColorPalette` value object so
 * there is a single source of truth for every hex value.
 */
export function getPaletteTones(paletteName: ColorPaletteName): PaletteToneMap {
  const palette = ColorPalette.create(paletteName);

  return Object.fromEntries(
    SHIFT_TYPE_VALUES.map((tone) => [
      tone,
      palette.getToneFor(ShiftType.create(tone)),
    ]),
  ) as PaletteToneMap;
}

/** Tone keys in display order: lightest → darkest. */
export const SHIFT_TONE_ORDER: readonly ShiftTypeValue[] = [
  "morning",
  "day",
  "afternoon",
  "night",
] as const;
