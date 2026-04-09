import { ValidationError } from "@/domain/errors/DomainError";

export const SHIFT_TYPE_VALUES = [
  "morning",
  "day",
  "afternoon",
  "night",
] as const;

export type ShiftTypeValue = (typeof SHIFT_TYPE_VALUES)[number];
export type ShiftTone = "lightest" | "light" | "medium" | "darkest";

const SHIFT_TONE_BY_TYPE: Record<ShiftTypeValue, ShiftTone> = {
  morning: "lightest",
  day: "light",
  afternoon: "medium",
  night: "darkest",
};

export class ShiftType {
  private constructor(public readonly value: ShiftTypeValue) {}

  static create(value: string): ShiftType {
    const normalizedValue = value.trim().toLowerCase() as ShiftTypeValue;

    if (!SHIFT_TYPE_VALUES.includes(normalizedValue)) {
      throw new ValidationError(
        `Shift type must be one of: ${SHIFT_TYPE_VALUES.join(", ")}`,
      );
    }

    return new ShiftType(normalizedValue);
  }

  getTone(): ShiftTone {
    return SHIFT_TONE_BY_TYPE[this.value];
  }

  equals(other: ShiftType): boolean {
    return this.value === other.value;
  }
}
