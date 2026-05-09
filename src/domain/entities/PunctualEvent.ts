import {
  Event,
  type EventProps,
  assertValidTimeRange,
} from "@/domain/entities/Event";
import { ValidationError } from "@/domain/errors/DomainError";
import type { EventCategory } from "@/domain/entities/RecurringEvent";
import { ShiftType } from "@/domain/value-objects/ShiftType";

export interface PunctualEventProps extends EventProps {
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  category?: EventCategory | null;
  shiftType?: ShiftType | null;
}

export class PunctualEvent extends Event {
  public readonly type = "punctual" as const;
  public readonly date: Date;
  public readonly startTime: string | null;
  public readonly endTime: string | null;
  public readonly category: EventCategory | null;
  public readonly shiftType: ShiftType | null;

  constructor(props: PunctualEventProps) {
    super(props);

    if (Number.isNaN(props.date.getTime())) {
      throw new ValidationError("Punctual event date must be a valid date");
    }

    assertValidTimeRange(props.startTime, props.endTime);

    const category = props.category ?? null;
    const shiftType = props.shiftType ?? null;

    if (
      (category === "work" || category === "studies") &&
      !shiftType
    ) {
      throw new ValidationError(
        "Punctual work or studies events require a shift type",
      );
    }

    if (
      (category === "other" || category === "vacations") &&
      shiftType
    ) {
      throw new ValidationError(
        "Punctual other/vacations events cannot define a shift type",
      );
    }

    if (category === null && shiftType !== null) {
      throw new ValidationError(
        "Punctual event shift type requires a category",
      );
    }

    this.date = props.date;
    this.startTime = props.startTime ?? null;
    this.endTime = props.endTime ?? null;
    this.category = category;
    this.shiftType = shiftType;
  }
}
