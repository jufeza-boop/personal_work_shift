import type { Event } from "@/domain/entities/Event";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import {
  deleteMockEvent,
  findMockEventById,
  findMockEventsByFamilyId,
  saveMockEvent,
} from "@/infrastructure/events/mockEventStore";

export class MockEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    return findMockEventById(id);
  }

  async findByFamilyId(familyId: string): Promise<Event[]> {
    return findMockEventsByFamilyId(familyId);
  }

  async save(event: Event): Promise<void> {
    saveMockEvent(event);
  }

  async delete(eventId: string): Promise<void> {
    deleteMockEvent(eventId);
  }
}
