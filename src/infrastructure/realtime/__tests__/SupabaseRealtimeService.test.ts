import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RealtimeEventHandlers } from "@/application/services/IRealtimeService";
import { SupabaseRealtimeService } from "@/infrastructure/realtime/SupabaseRealtimeService";
import type { Database, EventRow } from "@/infrastructure/supabase/database.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPunctualRow(overrides: Partial<EventRow> = {}): EventRow {
  return {
    category: null,
    created_at: "2026-04-01T00:00:00.000Z",
    created_by: "user-1",
    description: null,
    end_date: null,
    end_time: null,
    event_date: "2026-04-10",
    event_type: "punctual",
    family_id: "family-1",
    frequency_interval: null,
    frequency_unit: null,
    id: "event-1",
    parent_event_id: null,
    shift_type: null,
    start_date: null,
    start_time: null,
    title: "Doctor visit",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildRecurringRow(overrides: Partial<EventRow> = {}): EventRow {
  return {
    category: "work",
    created_at: "2026-04-01T00:00:00.000Z",
    created_by: "user-2",
    description: null,
    end_date: null,
    end_time: null,
    event_date: null,
    event_type: "recurring",
    family_id: "family-1",
    frequency_interval: 1,
    frequency_unit: "weekly",
    id: "event-2",
    parent_event_id: null,
    shift_type: "morning",
    start_date: "2026-04-07",
    start_time: null,
    title: "Morning shift",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock Supabase channel builder
// ---------------------------------------------------------------------------

type PayloadCallback = (payload: { new: unknown; old: unknown }) => void;

interface MockChannel {
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
  _trigger: (
    event: "INSERT" | "UPDATE" | "DELETE",
    payload: { new: unknown; old: unknown },
  ) => void;
}

function buildMockChannel(): MockChannel {
  const callbacks = new Map<string, PayloadCallback>();

  const channel: MockChannel = {
    on: vi.fn((_, config: { event: string }, cb: PayloadCallback) => {
      callbacks.set(config.event, cb);
      return channel;
    }),
    subscribe: vi.fn(() => channel),
    _trigger: (event, payload) => {
      const cb = callbacks.get(event);
      cb?.(payload);
    },
  };

  return channel;
}

function buildMockClient(mockChannel: MockChannel) {
  return {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn().mockResolvedValue(undefined),
  } as unknown as SupabaseClient<Database>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SupabaseRealtimeService", () => {
  let mockChannel: MockChannel;
  let mockClient: SupabaseClient<Database>;
  let service: SupabaseRealtimeService;
  let handlers: RealtimeEventHandlers;

  beforeEach(() => {
    mockChannel = buildMockChannel();
    mockClient = buildMockClient(mockChannel);
    service = new SupabaseRealtimeService(mockClient);
    handlers = {
      onDelete: vi.fn(),
      onInsert: vi.fn(),
      onUpdate: vi.fn(),
    };
  });

  describe("subscribe", () => {
    it("creates a channel with the correct name", () => {
      service.subscribe("family-1", handlers);
      expect(mockClient.channel).toHaveBeenCalledWith("events:family:family-1");
    });

    it("registers postgres_changes listeners for INSERT, UPDATE, DELETE", () => {
      service.subscribe("family-1", handlers);
      expect(mockChannel.on).toHaveBeenCalledTimes(3);
    });

    it("calls subscribe on the channel", () => {
      service.subscribe("family-1", handlers);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
    });

    it("calls onInsert with a serialized punctual event when INSERT fires", () => {
      service.subscribe("family-1", handlers);
      const row = buildPunctualRow();
      mockChannel._trigger("INSERT", { new: row, old: {} });

      expect(handlers.onInsert).toHaveBeenCalledTimes(1);
      expect(handlers.onInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "punctual",
          id: "event-1",
          createdBy: "user-1",
          date: "2026-04-10",
          familyId: "family-1",
          title: "Doctor visit",
        }),
      );
    });

    it("calls onInsert with a serialized recurring event when INSERT fires", () => {
      service.subscribe("family-1", handlers);
      const row = buildRecurringRow();
      mockChannel._trigger("INSERT", { new: row, old: {} });

      expect(handlers.onInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "recurring",
          id: "event-2",
          category: "work",
          frequencyUnit: "weekly",
          shiftType: "morning",
          startDate: "2026-04-07",
        }),
      );
    });

    it("calls onUpdate with the updated serialized event when UPDATE fires", () => {
      service.subscribe("family-1", handlers);
      const row = buildPunctualRow({ title: "Updated title" });
      mockChannel._trigger("UPDATE", { new: row, old: {} });

      expect(handlers.onUpdate).toHaveBeenCalledTimes(1);
      expect(handlers.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Updated title" }),
      );
    });

    it("calls onDelete with the event id when DELETE fires", () => {
      service.subscribe("family-1", handlers);
      mockChannel._trigger("DELETE", {
        new: {},
        old: { id: "event-1" },
      });

      expect(handlers.onDelete).toHaveBeenCalledWith("event-1");
    });

    it("does not call onDelete when the deleted row has no id", () => {
      service.subscribe("family-1", handlers);
      mockChannel._trigger("DELETE", { new: {}, old: {} });
      expect(handlers.onDelete).not.toHaveBeenCalled();
    });

    it("normalizes HH:MM:SS start/end times to HH:MM", () => {
      service.subscribe("family-1", handlers);
      const row = buildPunctualRow({
        end_time: "14:00:00",
        start_time: "09:00:00",
      });
      mockChannel._trigger("INSERT", { new: row, old: {} });

      expect(handlers.onInsert).toHaveBeenCalledWith(
        expect.objectContaining({ startTime: "09:00", endTime: "14:00" }),
      );
    });

    it("defaults recurring fields when frequency data is missing", () => {
      service.subscribe("family-1", handlers);
      const row = buildRecurringRow({
        frequency_interval: null,
        frequency_unit: null,
      });
      mockChannel._trigger("INSERT", { new: row, old: {} });

      expect(handlers.onInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          frequencyUnit: "weekly",
          frequencyInterval: 1,
        }),
      );
    });
  });

  describe("unsubscribe", () => {
    it("removes the channel from the Supabase client", () => {
      service.subscribe("family-1", handlers);
      service.unsubscribe();
      expect(mockClient.removeChannel).toHaveBeenCalledTimes(1);
    });

    it("sets the internal channel reference to null", () => {
      service.subscribe("family-1", handlers);
      service.unsubscribe();
      // Second unsubscribe should not call removeChannel again
      service.unsubscribe();
      expect(mockClient.removeChannel).toHaveBeenCalledTimes(1);
    });

    it("is safe to call before subscribe", () => {
      expect(() => service.unsubscribe()).not.toThrow();
    });
  });
});
