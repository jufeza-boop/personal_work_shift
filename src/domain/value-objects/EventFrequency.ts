import { ValidationError } from "@/domain/errors/DomainError";

export const EVENT_FREQUENCY_VALUES = ["daily", "weekly", "annual"] as const;

export type EventFrequencyUnit = (typeof EVENT_FREQUENCY_VALUES)[number];

export class EventFrequency {
  private constructor(
    public readonly unit: EventFrequencyUnit,
    public readonly interval: number,
  ) {}

  static create(unit: string, interval: number): EventFrequency {
    const normalizedUnit = unit.trim().toLowerCase() as EventFrequencyUnit;

    if (!EVENT_FREQUENCY_VALUES.includes(normalizedUnit)) {
      throw new ValidationError(
        `Event frequency must be one of: ${EVENT_FREQUENCY_VALUES.join(", ")}`,
      );
    }

    if (!Number.isInteger(interval) || interval < 1) {
      throw new ValidationError(
        "Event frequency interval must be greater than zero",
      );
    }

    return new EventFrequency(normalizedUnit, interval);
  }

  equals(other: EventFrequency): boolean {
    return this.unit === other.unit && this.interval === other.interval;
  }
}
