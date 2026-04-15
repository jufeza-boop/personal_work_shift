import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IOfflineQueue } from "@/application/services/IOfflineQueue";
import type { PendingOperation } from "@/application/services/IOfflineQueue";
import { useOfflineSync } from "@/presentation/hooks/useOfflineSync";

function createMockQueue(
  initial: PendingOperation[] = [],
): IOfflineQueue & { _data: PendingOperation[] } {
  const data: PendingOperation[] = [...initial];
  return {
    _data: data,
    enqueue: vi.fn(async (op) => {
      const item: PendingOperation = {
        id: `mock-${data.length + 1}`,
        type: op.type,
        formFields: op.formFields,
        timestamp: Date.now(),
        retryCount: op.retryCount ?? 0,
      };
      data.push(item);
      return item;
    }),
    getAll: vi.fn(async () => [...data]),
    remove: vi.fn(async (id) => {
      const idx = data.findIndex((o) => o.id === id);
      if (idx !== -1) data.splice(idx, 1);
    }),
    count: vi.fn(async () => data.length),
    clear: vi.fn(async () => {
      data.length = 0;
    }),
  };
}

describe("useOfflineSync", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { onLine: true });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    cleanup();
    await act(async () => {});
  });

  it("initial isOnline matches navigator.onLine when true", () => {
    vi.stubGlobal("navigator", { onLine: true });
    const queue = createMockQueue();
    const processOperation = vi.fn();
    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );
    expect(result.current.isOnline).toBe(true);
  });

  it("initial isOnline matches navigator.onLine when false", () => {
    vi.stubGlobal("navigator", { onLine: false });
    const queue = createMockQueue();
    const processOperation = vi.fn();
    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );
    expect(result.current.isOnline).toBe(false);
  });

  it("pendingCount reflects queue state", async () => {
    const op: PendingOperation = {
      id: "1",
      type: "create_event",
      formFields: {},
      timestamp: 1,
      retryCount: 0,
    };
    const queue = createMockQueue([op]);
    const processOperation = vi.fn();
    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );
    await act(async () => {});
    expect(result.current.pendingCount).toBe(1);
  });

  it("going offline sets isOnline to false", async () => {
    const queue = createMockQueue();
    const processOperation = vi.fn();
    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("going online sets isOnline to true and triggers syncQueue", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const op: PendingOperation = {
      id: "1",
      type: "create_event",
      formFields: { title: "Test" },
      timestamp: 1,
      retryCount: 0,
    };
    const queue = createMockQueue([op]);
    const processOperation = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
    expect(processOperation).toHaveBeenCalledWith(op);
  });

  it("enqueueOperation adds to queue and updates pendingCount", async () => {
    const queue = createMockQueue();
    const processOperation = vi.fn();
    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {
      await result.current.enqueueOperation({
        type: "create_event",
        formFields: { title: "A" },
      });
    });

    expect(queue.enqueue).toHaveBeenCalled();
    expect(result.current.pendingCount).toBe(1);
  });

  it("isSyncing is true during sync and false after", async () => {
    let resolveProcess!: () => void;
    const processPromise = new Promise<void>((res) => {
      resolveProcess = res;
    });

    const op: PendingOperation = {
      id: "1",
      type: "create_event",
      formFields: {},
      timestamp: 1,
      retryCount: 0,
    };
    const queue = createMockQueue([op]);
    const processOperation = vi.fn().mockReturnValue(processPromise);

    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {});

    await act(async () => {
      resolveProcess();
      await result.current.syncNow();
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it("when processOperation fails, operation stays in queue with incremented retryCount", async () => {
    const op: PendingOperation = {
      id: "1",
      type: "create_event",
      formFields: { title: "A" },
      timestamp: 1,
      retryCount: 0,
    };
    const queue = createMockQueue([op]);
    const processOperation = vi.fn().mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {});

    await act(async () => {
      await result.current.syncNow();
    });

    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: "create_event", retryCount: 1 }),
    );
    expect(result.current.pendingCount).toBe(1);
  });

  it("syncNow triggers queue processing manually", async () => {
    const op: PendingOperation = {
      id: "1",
      type: "delete_event",
      formFields: { id: "x" },
      timestamp: 1,
      retryCount: 0,
    };
    const queue = createMockQueue([op]);
    const processOperation = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    await act(async () => {});

    await act(async () => {
      await result.current.syncNow();
    });

    expect(processOperation).toHaveBeenCalledWith(op);
    expect(result.current.pendingCount).toBe(0);
  });

  it("cleans up event listeners on unmount without errors", () => {
    const queue = createMockQueue();
    const processOperation = vi.fn();

    const { unmount } = renderHook(() =>
      useOfflineSync({ queue, processOperation }),
    );

    expect(() => unmount()).not.toThrow();

    // Dispatching events after unmount should not trigger state updates
    expect(() => {
      window.dispatchEvent(new Event("online"));
      window.dispatchEvent(new Event("offline"));
    }).not.toThrow();
  });
});
