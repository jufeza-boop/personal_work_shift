import { Event } from "@/domain/entities/Event";
import { EventException } from "@/domain/entities/EventException";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByFamilyId(familyId: string): Promise<Event[]>;
  findExceptionsByEventIds(eventIds: string[]): Promise<EventException[]>;
  save(event: Event): Promise<void>;
  delete(eventId: string): Promise<void>;
  saveException(exception: EventException): Promise<void>;
  deleteExceptionsByEventId(eventId: string): Promise<void>;
}
