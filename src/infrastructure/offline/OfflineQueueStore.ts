import type {
  IOfflineQueue,
  PendingOperation,
} from "@/application/services/IOfflineQueue";

export interface DbBackend {
  add(item: PendingOperation): Promise<void>;
  getAll(): Promise<PendingOperation[]>;
  remove(id: string): Promise<void>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

const DB_NAME = "pws-offline-queue";
const STORE_NAME = "operations";

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function createIndexedDbBackend(): Promise<DbBackend> {
  const db = await openDb();

  return {
    add: async (item) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      await idbReq(tx.objectStore(STORE_NAME).add(item));
    },
    getAll: async () => {
      const tx = db.transaction(STORE_NAME, "readonly");
      return idbReq<PendingOperation[]>(
        tx.objectStore(STORE_NAME).getAll() as IDBRequest<PendingOperation[]>,
      );
    },
    remove: async (id) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      await idbReq(tx.objectStore(STORE_NAME).delete(id));
    },
    count: async () => {
      const tx = db.transaction(STORE_NAME, "readonly");
      return idbReq(tx.objectStore(STORE_NAME).count());
    },
    clear: async () => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      await idbReq(tx.objectStore(STORE_NAME).clear());
    },
  };
}

export class OfflineQueueStore implements IOfflineQueue {
  constructor(
    private readonly backendFactory: () => Promise<DbBackend> = createIndexedDbBackend,
  ) {}

  async enqueue(
    op: Pick<PendingOperation, "type" | "formFields"> & {
      retryCount?: number;
    },
  ): Promise<PendingOperation> {
    const backend = await this.backendFactory();
    const item: PendingOperation = {
      id: crypto.randomUUID(),
      type: op.type,
      formFields: op.formFields,
      timestamp: Date.now(),
      retryCount: op.retryCount ?? 0,
    };
    await backend.add(item);
    return item;
  }

  async getAll(): Promise<PendingOperation[]> {
    const backend = await this.backendFactory();
    return backend.getAll();
  }

  async remove(id: string): Promise<void> {
    const backend = await this.backendFactory();
    return backend.remove(id);
  }

  async count(): Promise<number> {
    const backend = await this.backendFactory();
    return backend.count();
  }

  async clear(): Promise<void> {
    const backend = await this.backendFactory();
    return backend.clear();
  }
}
