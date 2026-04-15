import type { SerializedEvent } from "@/application/services/calendarUtils";

export interface RealtimeEventHandlers {
  onInsert: (event: SerializedEvent) => void;
  onUpdate: (event: SerializedEvent) => void;
  onDelete: (eventId: string) => void;
}

export interface IRealtimeService {
  subscribe(familyId: string, handlers: RealtimeEventHandlers): void;
  unsubscribe(): void;
}
