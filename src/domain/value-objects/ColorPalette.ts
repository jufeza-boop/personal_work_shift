import { ValidationError } from "@/domain/errors/DomainError";
import type { ShiftType } from "@/domain/value-objects/ShiftType";

const PALETTE_DEFINITIONS = {
  sky: {
    morning: "#E0F2FE",
    day: "#BAE6FD",
    afternoon: "#7DD3FC",
    night: "#0284C7",
  },
  rose: {
    morning: "#FFE4E6",
    day: "#FECDD3",
    afternoon: "#FDA4AF",
    night: "#E11D48",
  },
  violet: {
    morning: "#F3E8FF",
    day: "#DDD6FE",
    afternoon: "#C4B5FD",
    night: "#7C3AED",
  },
  emerald: {
    morning: "#D1FAE5",
    day: "#A7F3D0",
    afternoon: "#6EE7B7",
    night: "#059669",
  },
  amber: {
    morning: "#FEF3C7",
    day: "#FDE68A",
    afternoon: "#FCD34D",
    night: "#D97706",
  },
  coral: {
    morning: "#FFE5D9",
    day: "#FEC5BB",
    afternoon: "#FCA5A5",
    night: "#EA580C",
  },
  slate: {
    morning: "#E2E8F0",
    day: "#CBD5E1",
    afternoon: "#94A3B8",
    night: "#475569",
  },
  teal: {
    morning: "#CCFBF1",
    day: "#99F6E4",
    afternoon: "#5EEAD4",
    night: "#0F766E",
  },
} as const;

export type ColorPaletteName = keyof typeof PALETTE_DEFINITIONS;
export type ColorPaletteToneMap = (typeof PALETTE_DEFINITIONS)[ColorPaletteName];

const COLOR_PALETTE_VALUES = Object.keys(PALETTE_DEFINITIONS) as ColorPaletteName[];

export class ColorPalette {
  private constructor(
    public readonly name: ColorPaletteName,
    private readonly toneMap: ColorPaletteToneMap,
  ) {}

  static create(name: string): ColorPalette {
    const normalizedName = name.trim().toLowerCase() as ColorPaletteName;

    if (!COLOR_PALETTE_VALUES.includes(normalizedName)) {
      throw new ValidationError(
        `Color palette must be one of: ${COLOR_PALETTE_VALUES.join(", ")}`,
      );
    }

    return new ColorPalette(normalizedName, PALETTE_DEFINITIONS[normalizedName]);
  }

  static availablePalettes(): ColorPaletteName[] {
    return [...COLOR_PALETTE_VALUES];
  }

  getToneFor(shiftType: ShiftType): string {
    return this.toneMap[shiftType.value];
  }

  equals(other: ColorPalette): boolean {
    return this.name === other.name;
  }
}
