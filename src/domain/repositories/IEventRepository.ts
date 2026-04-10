import { Event } from "@/domain/entities/Event";

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByFamilyId(familyId: string): Promise<Event[]>;
  save(event: Event): Promise<void>;
  delete(eventId: string): Promise<void>;
}
