import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { Event } from "@/domain/entities/Event";
import {
  EventException,
  type EventExceptionOverrideData,
} from "@/domain/entities/EventException";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";

interface StoredPunctualEvent {
  eventType: "punctual";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StoredRecurringEvent {
  eventType: "recurring";
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  description: string | null;
  category: "work" | "studies" | "other";
  startDate: string;
  frequencyUnit: string;
  frequencyInterval: number;
  shiftType: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

type StoredEvent = StoredPunctualEvent | StoredRecurringEvent;

export interface StoredEventException {
  id: string;
  eventId: string;
  exceptionDate: string;
  isDeleted: boolean;
  overrideData: EventExceptionOverrideData | null;
  createdAt: string;
}

interface MockEventStoreShape {
  eventsById: Record<string, StoredEvent>;
  exceptionsById: Record<string, StoredEventException>;
}

const STORE_PATH = join(
  tmpdir(),
  "personal-work-shift",
  "mock-event-store.json",
);

function ensureStoreDirectory(): void {
  const directory = dirname(STORE_PATH);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function getStore(): MockEventStoreShape {
  ensureStoreDirectory();

  if (!existsSync(STORE_PATH)) {
    return { eventsById: {}, exceptionsById: {} };
  }

  try {
    const parsed = JSON.parse(
      readFileSync(STORE_PATH, "utf8"),
    ) as MockEventStoreShape;
    return {
      eventsById: parsed.eventsById ?? {},
      exceptionsById: parsed.exceptionsById ?? {},
    };
  } catch {
    return { eventsById: {}, exceptionsById: {} };
  }
}

function saveStore(store: MockEventStoreShape): void {
  ensureStoreDirectory();
  const tempStorePath = join(dirname(STORE_PATH), `${randomUUID()}.tmp`);

  try {
    writeFileSync(tempStorePath, JSON.stringify(store), "utf8");
    renameSync(tempStorePath, STORE_PATH);
  } catch (error) {
    throw new Error(
      `Unable to persist the mock event store at ${STORE_PATH}: ${
        error instanceof Error ? error.message : "unknown error"
      }. Check that the directory is writable and that enough disk space is available.`,
    );
  }
}

function serializeEvent(event: Event): StoredEvent {
  if (event instanceof PunctualEvent) {
    return {
      createdAt: event.createdAt.toISOString(),
      createdBy: event.createdBy,
      date: event.date.toISOString(),
      description: event.description,
      endTime: event.endTime,
      eventType: "punctual",
      familyId: event.familyId,
      id: event.id,
      startTime: event.startTime,
      title: event.title,
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  if (!(event instanceof RecurringEvent)) {
    throw new TypeError("Unsupported event type");
  }

  return {
    category: event.category,
    createdAt: event.createdAt.toISOString(),
    createdBy: event.createdBy,
    description: event.description,
    endDate: event.endDate ? event.endDate.toISOString() : null,
    endTime: event.endTime,
    eventType: "recurring",
    familyId: event.familyId,
    frequencyInterval: event.frequency.interval,
    frequencyUnit: event.frequency.unit,
    id: event.id,
    shiftType: event.shiftType?.value ?? null,
    startDate: event.startDate.toISOString(),
    startTime: event.startTime,
    title: event.title,
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function toDomainEvent(stored: StoredEvent): Event {
  if (stored.eventType === "punctual") {
    return new PunctualEvent({
      createdAt: new Date(stored.createdAt),
      createdBy: stored.createdBy,
      date: new Date(stored.date),
      description: stored.description,
      endTime: stored.endTime,
      familyId: stored.familyId,
      id: stored.id,
      startTime: stored.startTime,
      title: stored.title,
      updatedAt: new Date(stored.updatedAt),
    });
  }

  return new RecurringEvent({
    category: stored.category,
    createdAt: new Date(stored.createdAt),
    createdBy: stored.createdBy,
    description: stored.description,
    endDate: stored.endDate ? new Date(stored.endDate) : null,
    endTime: stored.endTime,
    familyId: stored.familyId,
    frequency: EventFrequency.create(
      stored.frequencyUnit,
      stored.frequencyInterval,
    ),
    id: stored.id,
    shiftType: stored.shiftType ? ShiftType.create(stored.shiftType) : null,
    startDate: new Date(stored.startDate),
    startTime: stored.startTime,
    title: stored.title,
    updatedAt: new Date(stored.updatedAt),
  });
}

export function findMockEventById(id: string): Event | null {
  const stored = getStore().eventsById[id];

  return stored ? toDomainEvent(stored) : null;
}

export function findMockEventsByFamilyId(familyId: string): Event[] {
  return Object.values(getStore().eventsById)
    .filter((stored) => stored.familyId === familyId)
    .map(toDomainEvent);
}

export function saveMockEvent(event: Event): void {
  const store = getStore();

  store.eventsById[event.id] = serializeEvent(event);
  saveStore(store);
}

export function deleteMockEvent(eventId: string): void {
  const store = getStore();

  delete store.eventsById[eventId];
  saveStore(store);
}

export function saveMockException(exception: EventException): void {
  const store = getStore();
  store.exceptionsById[exception.id] = {
    id: exception.id,
    eventId: exception.eventId,
    exceptionDate: exception.exceptionDate.toISOString(),
    isDeleted: exception.isDeleted,
    overrideData: exception.overrideData,
    createdAt: exception.createdAt.toISOString(),
  };
  saveStore(store);
}
