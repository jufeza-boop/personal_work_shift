import { ColorPaletteAlreadyTakenError } from "@/domain/errors/DomainError";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export function isColorPaletteExclusive(
  colorPalette: ColorPalette,
  assignedPalettes: ColorPalette[],
): boolean {
  return !assignedPalettes.some((assignedPalette) =>
    assignedPalette.equals(colorPalette),
  );
}

export function assertColorPaletteExclusive(
  colorPalette: ColorPalette,
  assignedPalettes: ColorPalette[],
): void {
  if (!isColorPaletteExclusive(colorPalette, assignedPalettes)) {
    throw new ColorPaletteAlreadyTakenError(colorPalette.name);
  }
}
