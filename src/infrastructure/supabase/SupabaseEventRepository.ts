import type { SupabaseClient } from "@supabase/supabase-js";
import { type Event } from "@/domain/entities/Event";
import { EventException } from "@/domain/entities/EventException";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";
import type {
  Database,
  EventRow,
} from "@/infrastructure/supabase/database.types";

function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/**
 * Converts a YYYY-MM-DD database date into a UTC Date instance anchored at
 * midnight so the domain layer can treat it as a calendar date consistently.
 */
function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function normalizeTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

function mapEvent(row: EventRow): Event {
  if (row.event_type === "punctual") {
    return new PunctualEvent({
      createdAt: new Date(row.created_at),
      createdBy: row.created_by,
      date: toDate(row.event_date as string),
      description: row.description,
      endTime: normalizeTime(row.end_time),
      familyId: row.family_id,
      id: row.id,
      startTime: normalizeTime(row.start_time),
      title: row.title,
      updatedAt: new Date(row.updated_at),
    });
  }

  return new RecurringEvent({
    category: row.category ?? "other",
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    description: row.description,
    endDate: row.end_date ? toDate(row.end_date) : null,
    endTime: normalizeTime(row.end_time),
    familyId: row.family_id,
    frequency: EventFrequency.create(
      row.frequency_unit ?? "weekly",
      row.frequency_interval ?? 1,
    ),
    id: row.id,
    shiftType: row.shift_type ? ShiftType.create(row.shift_type) : null,
    startDate: toDate(row.start_date as string),
    startTime: normalizeTime(row.start_time),
    title: row.title,
    updatedAt: new Date(row.updated_at),
  });
}

function toRow(event: Event): Database["public"]["Tables"]["events"]["Insert"] {
  if (event instanceof PunctualEvent) {
    return {
      created_at: event.createdAt.toISOString(),
      created_by: event.createdBy,
      description: event.description,
      end_time: event.endTime,
      event_date: toDateOnlyString(event.date),
      event_type: "punctual",
      family_id: event.familyId,
      id: event.id,
      start_time: event.startTime,
      title: event.title,
      updated_at: event.updatedAt.toISOString(),
    };
  }

  if (!(event instanceof RecurringEvent)) {
    throw new TypeError("Unsupported event type");
  }

  return {
    category: event.category,
    created_at: event.createdAt.toISOString(),
    created_by: event.createdBy,
    description: event.description,
    end_date: event.endDate ? toDateOnlyString(event.endDate) : null,
    end_time: event.endTime,
    event_type: "recurring",
    family_id: event.familyId,
    frequency_interval: event.frequency.interval,
    frequency_unit: event.frequency.unit,
    id: event.id,
    shift_type: event.shiftType?.value ?? null,
    start_date: toDateOnlyString(event.startDate),
    start_time: event.startTime,
    title: event.title,
    updated_at: event.updatedAt.toISOString(),
  };
}

export class SupabaseEventRepository implements IEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(eventId: string): Promise<void> {
    const { error } = await this.client
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      throw error;
    }
  }

  async findByFamilyId(familyId: string): Promise<Event[]> {
    const { data, error } = await this.client
      .from("events")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(mapEvent);
  }

  async findById(id: string): Promise<Event | null> {
    const { data, error } = await this.client
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapEvent(data) : null;
  }

  async findExceptionsByEventIds(
    eventIds: string[],
  ): Promise<EventException[]> {
    if (eventIds.length === 0) {
      return [];
    }

    const { data, error } = await (this.client as unknown as SupabaseClient)
      .from("event_exceptions")
      .select("*")
      .in("event_id", eventIds);

    if (error) {
      throw error;
    }

    return (data ?? []).map(
      (row: {
        id: string;
        event_id: string;
        exception_date: string;
        is_deleted: boolean;
        override_data: unknown;
        created_at: string;
      }) =>
        new EventException({
          id: row.id,
          eventId: row.event_id,
          exceptionDate: new Date(`${row.exception_date}T00:00:00.000Z`),
          isDeleted: row.is_deleted,
          overrideData: row.override_data as EventException["overrideData"],
          createdAt: new Date(row.created_at),
        }),
    );
  }

  async save(event: Event): Promise<void> {
    const { error } = await this.client.from("events").upsert(toRow(event), {
      onConflict: "id",
    });

    if (error) {
      throw error;
    }
  }

  async saveException(exception: EventException): Promise<void> {
    const { error } = await (this.client as unknown as SupabaseClient)
      .from("event_exceptions")
      .upsert(
        {
          id: exception.id,
          event_id: exception.eventId,
          exception_date: exception.exceptionDate.toISOString().slice(0, 10),
          is_deleted: exception.isDeleted,
          override_data: exception.overrideData,
          created_at: exception.createdAt.toISOString(),
        },
        { onConflict: "event_id,exception_date" },
      );

    if (error) {
      throw error;
    }
  }
}
