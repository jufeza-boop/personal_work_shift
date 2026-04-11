import { ValidationError } from "@/domain/errors/DomainError";

export interface EventExceptionOverrideData {
  title?: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface EventExceptionProps {
  id: string;
  eventId: string;
  exceptionDate: Date;
  isDeleted: boolean;
  overrideData: EventExceptionOverrideData | null;
  createdAt?: Date;
}

export class EventException {
  public readonly id: string;
  public readonly eventId: string;
  public readonly exceptionDate: Date;
  public readonly isDeleted: boolean;
  public readonly overrideData: EventExceptionOverrideData | null;
  public readonly createdAt: Date;

  constructor(props: EventExceptionProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError("EventException id cannot be empty");
    }
    if (!props.eventId || props.eventId.trim().length === 0) {
      throw new ValidationError("EventException eventId cannot be empty");
    }
    if (Number.isNaN(props.exceptionDate.getTime())) {
      throw new ValidationError(
        "EventException exceptionDate must be a valid date",
      );
    }
    this.id = props.id;
    this.eventId = props.eventId;
    this.exceptionDate = props.exceptionDate;
    this.isDeleted = props.isDeleted;
    this.overrideData = props.overrideData;
    this.createdAt = props.createdAt ?? new Date();
  }
}
