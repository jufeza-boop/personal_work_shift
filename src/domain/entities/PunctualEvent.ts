import {
  Event,
  type EventProps,
  assertValidTimeRange,
} from "@/domain/entities/Event";
import { ValidationError } from "@/domain/errors/DomainError";

export interface PunctualEventProps extends EventProps {
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
}

export class PunctualEvent extends Event {
  public readonly type = "punctual" as const;
  public readonly date: Date;
  public readonly startTime: string | null;
  public readonly endTime: string | null;

  constructor(props: PunctualEventProps) {
    super(props);

    if (Number.isNaN(props.date.getTime())) {
      throw new ValidationError("Punctual event date must be a valid date");
    }

    assertValidTimeRange(props.startTime, props.endTime);

    this.date = props.date;
    this.startTime = props.startTime ?? null;
    this.endTime = props.endTime ?? null;
  }
}
