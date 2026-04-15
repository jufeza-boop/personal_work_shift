import { describe, expect, it } from "vitest";
import type { DbBackend } from "@/infrastructure/offline/OfflineQueueStore";
import { OfflineQueueStore } from "@/infrastructure/offline/OfflineQueueStore";

function createMemoryBackend(): () => Promise<DbBackend> {
  const data = new Map<
    string,
    import("@/application/services/IOfflineQueue").PendingOperation
  >();
  return () =>
    Promise.resolve({
      add: async (item) => {
        data.set(item.id, item);
      },
      getAll: async () => Array.from(data.values()),
      remove: async (id) => {
        data.delete(id);
      },
      count: async () => data.size,
      clear: async () => {
        data.clear();
      },
    });
}

describe("OfflineQueueStore", () => {
  it("enqueue generates a unique id and stores with retryCount=0", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    const op = await store.enqueue({
      type: "create_event",
      formFields: { title: "Test" },
    });

    expect(op.id).toBeTruthy();
    expect(op.type).toBe("create_event");
    expect(op.formFields).toEqual({ title: "Test" });
    expect(op.retryCount).toBe(0);
    expect(op.timestamp).toBeGreaterThan(0);
  });

  it("enqueue generates unique ids for multiple operations", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    const op1 = await store.enqueue({
      type: "create_event",
      formFields: { title: "A" },
    });
    const op2 = await store.enqueue({
      type: "delete_event",
      formFields: { id: "123" },
    });

    expect(op1.id).not.toBe(op2.id);
  });

  it("getAll returns all stored operations", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    await store.enqueue({ type: "create_event", formFields: { title: "A" } });
    await store.enqueue({ type: "edit_event", formFields: { title: "B" } });

    const all = await store.getAll();
    expect(all).toHaveLength(2);
  });

  it("remove deletes operation by id", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    const op = await store.enqueue({
      type: "create_event",
      formFields: { title: "A" },
    });
    await store.remove(op.id);

    const all = await store.getAll();
    expect(all).toHaveLength(0);
  });

  it("count returns the number of operations", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    expect(await store.count()).toBe(0);

    await store.enqueue({ type: "create_event", formFields: {} });
    expect(await store.count()).toBe(1);

    await store.enqueue({ type: "delete_event", formFields: {} });
    expect(await store.count()).toBe(2);
  });

  it("clear empties the store", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    await store.enqueue({ type: "create_event", formFields: {} });
    await store.enqueue({ type: "edit_event", formFields: {} });
    await store.clear();

    expect(await store.count()).toBe(0);
    expect(await store.getAll()).toHaveLength(0);
  });

  it("multiple enqueue/remove operations work correctly", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    const op1 = await store.enqueue({
      type: "create_event",
      formFields: { title: "A" },
    });
    const op2 = await store.enqueue({
      type: "create_event",
      formFields: { title: "B" },
    });
    const op3 = await store.enqueue({
      type: "delete_event",
      formFields: { id: "x" },
    });

    await store.remove(op2.id);
    const remaining = await store.getAll();
    expect(remaining).toHaveLength(2);
    expect(remaining.map((o) => o.id)).toContain(op1.id);
    expect(remaining.map((o) => o.id)).toContain(op3.id);
    expect(remaining.map((o) => o.id)).not.toContain(op2.id);
  });

  it("remove on non-existent id does nothing", async () => {
    const store = new OfflineQueueStore(createMemoryBackend());
    await store.enqueue({ type: "create_event", formFields: {} });
    await store.remove("non-existent-id");

    expect(await store.count()).toBe(1);
  });
});
