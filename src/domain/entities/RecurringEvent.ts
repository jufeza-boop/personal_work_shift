import { Event, type EventProps, assertValidTimeRange } from "@/domain/entities/Event";
import { ValidationError } from "@/domain/errors/DomainError";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

export type RecurringEventCategory = "work" | "studies" | "other";

export interface RecurringEventProps extends EventProps {
  category: RecurringEventCategory;
  startDate: Date;
  frequency: EventFrequency;
  shiftType?: ShiftType | null;
  endDate?: Date | null;
  startTime?: string | null;
  endTime?: string | null;
}

export class RecurringEvent extends Event {
  public readonly type = "recurring" as const;
  public readonly category: RecurringEventCategory;
  public readonly startDate: Date;
  public readonly frequency: EventFrequency;
  public readonly shiftType: ShiftType | null;
  public readonly endDate: Date | null;
  public readonly startTime: string | null;
  public readonly endTime: string | null;

  constructor(props: RecurringEventProps) {
    super(props);

    if (Number.isNaN(props.startDate.getTime())) {
      throw new ValidationError("Recurring event start date must be a valid date");
    }

    if (props.endDate && Number.isNaN(props.endDate.getTime())) {
      throw new ValidationError("Recurring event end date must be a valid date");
    }

    if (props.endDate && props.endDate.getTime() < props.startDate.getTime()) {
      throw new ValidationError(
        "Recurring event end date must be on or after the start date",
      );
    }

    assertValidTimeRange(props.startTime, props.endTime);

    if ((props.category === "work" || props.category === "studies") && !props.shiftType) {
      throw new ValidationError(
        "Recurring work or studies events require a shift type",
      );
    }

    if (props.category === "other" && props.shiftType) {
      throw new ValidationError("Recurring other events cannot define a shift type");
    }

    this.category = props.category;
    this.startDate = props.startDate;
    this.frequency = props.frequency;
    this.shiftType = props.shiftType ?? null;
    this.endDate = props.endDate ?? null;
    this.startTime = props.startTime ?? null;
    this.endTime = props.endTime ?? null;
  }
}
