import type { SupabaseClient } from "@supabase/supabase-js";
import type { SerializedEvent } from "@/application/services/calendarUtils";
import type {
  IRealtimeService,
  RealtimeEventHandlers,
} from "@/application/services/IRealtimeService";
import type {
  Database,
  EventRow,
} from "@/infrastructure/supabase/database.types";

type RealtimeChannel = ReturnType<SupabaseClient["channel"]>;

function normalizeTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

function mapEventRowToSerialized(row: EventRow): SerializedEvent {
  if (row.event_type === "punctual") {
    return {
      createdBy: row.created_by,
      date: row.event_date as string,
      endTime: normalizeTime(row.end_time),
      familyId: row.family_id,
      id: row.id,
      startTime: normalizeTime(row.start_time),
      title: row.title,
      type: "punctual",
    };
  }

  return {
    category: row.category ?? "other",
    createdBy: row.created_by,
    endDate: row.end_date,
    familyId: row.family_id,
    frequencyInterval: row.frequency_interval ?? 1,
    frequencyUnit: row.frequency_unit ?? "weekly",
    id: row.id,
    shiftType: row.shift_type,
    startDate: row.start_date as string,
    title: row.title,
    type: "recurring",
  };
}

export class SupabaseRealtimeService implements IRealtimeService {
  private channel: RealtimeChannel | null = null;

  constructor(private readonly client: SupabaseClient<Database>) {}

  subscribe(familyId: string, handlers: RealtimeEventHandlers): void {
    this.channel = this.client
      .channel(`events:family:${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `family_id=eq.${familyId}`,
          schema: "public",
          table: "events",
        },
        (payload) => {
          const event = mapEventRowToSerialized(payload.new as EventRow);
          handlers.onInsert(event);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          filter: `family_id=eq.${familyId}`,
          schema: "public",
          table: "events",
        },
        (payload) => {
          const event = mapEventRowToSerialized(payload.new as EventRow);
          handlers.onUpdate(event);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          filter: `family_id=eq.${familyId}`,
          schema: "public",
          table: "events",
        },
        (payload) => {
          const row = payload.old as Partial<EventRow>;
          if (row.id) {
            handlers.onDelete(row.id);
          }
        },
      )
      .subscribe();
  }

  unsubscribe(): void {
    if (this.channel) {
      void this.client.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
