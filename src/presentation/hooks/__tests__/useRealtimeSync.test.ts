import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SerializedEvent } from "@/application/services/calendarUtils";
import type {
  IRealtimeService,
  RealtimeEventHandlers,
} from "@/application/services/IRealtimeService";
import { useRealtimeSync } from "@/presentation/hooks/useRealtimeSync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildService(): IRealtimeService & {
  capturedHandlers: RealtimeEventHandlers | null;
} {
  let capturedHandlers: RealtimeEventHandlers | null = null;

  return {
    get capturedHandlers() {
      return capturedHandlers;
    },
    subscribe: vi.fn((_, handlers: RealtimeEventHandlers) => {
      capturedHandlers = handlers;
    }),
    unsubscribe: vi.fn(),
  };
}

const PUNCTUAL_EVENT: SerializedEvent = {
  createdBy: "user-1",
  date: "2026-04-10",
  endTime: null,
  familyId: "family-1",
  id: "event-1",
  startTime: null,
  title: "Doctor visit",
  type: "punctual",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useRealtimeSync", () => {
  let service: ReturnType<typeof buildService>;
  let onInsert: ReturnType<typeof vi.fn>;
  let onUpdate: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = buildService();
    onInsert = vi.fn();
    onUpdate = vi.fn();
    onDelete = vi.fn();
  });

  it("calls service.subscribe with the correct familyId on mount", () => {
    renderHook(() =>
      useRealtimeSync({
        familyId: "family-1",
        onDelete,
        onInsert,
        onUpdate,
        service,
      }),
    );

    expect(service.subscribe).toHaveBeenCalledWith(
      "family-1",
      expect.objectContaining({
        onInsert: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
      }),
    );
  });

  it("calls service.unsubscribe on unmount", () => {
    const { unmount } = renderHook(() =>
      useRealtimeSync({
        familyId: "family-1",
        onDelete,
        onInsert,
        onUpdate,
        service,
      }),
    );

    unmount();
    expect(service.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes when familyId changes", () => {
    const { rerender } = renderHook(
      ({ familyId }: { familyId: string }) =>
        useRealtimeSync({ familyId, onDelete, onInsert, onUpdate, service }),
      { initialProps: { familyId: "family-1" } },
    );

    rerender({ familyId: "family-2" });

    expect(service.unsubscribe).toHaveBeenCalledTimes(1);
    expect(service.subscribe).toHaveBeenCalledTimes(2);
    expect(service.subscribe).toHaveBeenLastCalledWith(
      "family-2",
      expect.any(Object),
    );
  });

  it("forwards INSERT payloads to the onInsert callback", () => {
    renderHook(() =>
      useRealtimeSync({
        familyId: "family-1",
        onDelete,
        onInsert,
        onUpdate,
        service,
      }),
    );

    service.capturedHandlers?.onInsert(PUNCTUAL_EVENT);
    expect(onInsert).toHaveBeenCalledWith(PUNCTUAL_EVENT);
  });

  it("forwards UPDATE payloads to the onUpdate callback", () => {
    renderHook(() =>
      useRealtimeSync({
        familyId: "family-1",
        onDelete,
        onInsert,
        onUpdate,
        service,
      }),
    );

    service.capturedHandlers?.onUpdate(PUNCTUAL_EVENT);
    expect(onUpdate).toHaveBeenCalledWith(PUNCTUAL_EVENT);
  });

  it("forwards DELETE payloads to the onDelete callback", () => {
    renderHook(() =>
      useRealtimeSync({
        familyId: "family-1",
        onDelete,
        onInsert,
        onUpdate,
        service,
      }),
    );

    service.capturedHandlers?.onDelete("event-1");
    expect(onDelete).toHaveBeenCalledWith("event-1");
  });

  it("does not re-subscribe when unrelated props change", () => {
    const { rerender } = renderHook(
      ({ label }: { label: string }) =>
        useRealtimeSync({
          familyId: "family-1",
          onDelete,
          onInsert: vi.fn().mockImplementation(() => label),
          onUpdate,
          service,
        }),
      { initialProps: { label: "a" } },
    );

    rerender({ label: "b" });
    // subscribe is called once on mount but NOT again on a handler-only change
    expect(service.subscribe).toHaveBeenCalledTimes(1);
  });
});
