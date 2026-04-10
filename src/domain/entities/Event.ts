import { ValidationError } from "@/domain/errors/DomainError";

export type EventType = "punctual" | "recurring";

export interface EventProps {
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function assertValidTimeFormat(label: "start" | "end", value: string): void {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new ValidationError(`Event ${label} time must use HH:MM format`);
  }
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export function assertValidTimeRange(
  startTime?: string | null,
  endTime?: string | null,
): void {
  if (!startTime && !endTime) {
    return;
  }

  if (startTime) {
    assertValidTimeFormat("start", startTime);
  }

  if (endTime) {
    assertValidTimeFormat("end", endTime);
  }

  if (endTime && !startTime) {
    throw new ValidationError(
      "Event start time is required when an end time is provided",
    );
  }

  if (startTime && endTime && toMinutes(endTime) <= toMinutes(startTime)) {
    throw new ValidationError(
      "Event end time must be later than the start time",
    );
  }
}

export abstract class Event {
  public readonly id: string;
  public readonly familyId: string;
  public readonly createdBy: string;
  public readonly title: string;
  public readonly description: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public abstract readonly type: EventType;

  protected constructor(props: EventProps) {
    const title = props.title.trim();

    if (title.length === 0) {
      throw new ValidationError("Event title cannot be empty");
    }

    this.id = props.id;
    this.familyId = props.familyId;
    this.createdBy = props.createdBy;
    this.title = title;
    this.description = props.description?.trim() || null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;

    if (!isValidDate(this.createdAt) || !isValidDate(this.updatedAt)) {
      throw new ValidationError("Event timestamps must be valid dates");
    }
  }
}
