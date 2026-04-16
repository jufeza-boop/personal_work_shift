import type { Event } from "@/domain/entities/Event";
import { EventException } from "@/domain/entities/EventException";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import {
  deleteMockEvent,
  findMockEventById,
  findMockEventsByFamilyId,
  findMockExceptionsByEventIds,
  saveMockEvent,
  saveMockException,
} from "@/infrastructure/events/mockEventStore";

export class MockEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    return findMockEventById(id);
  }

  async findByFamilyId(familyId: string): Promise<Event[]> {
    return findMockEventsByFamilyId(familyId);
  }

  async findExceptionsByEventIds(
    eventIds: string[],
  ): Promise<EventException[]> {
    return findMockExceptionsByEventIds(eventIds);
  }

  async save(event: Event): Promise<void> {
    saveMockEvent(event);
  }

  async delete(eventId: string): Promise<void> {
    deleteMockEvent(eventId);
  }

  async saveException(exception: EventException): Promise<void> {
    saveMockException(exception);
  }
}
