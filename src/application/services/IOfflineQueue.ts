export type PendingOperationType =
  | "create_event"
  | "edit_event"
  | "delete_event";

export interface PendingOperation {
  id: string;
  type: PendingOperationType;
  formFields: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

export interface IOfflineQueue {
  enqueue(
    op: Pick<PendingOperation, "type" | "formFields"> & {
      retryCount?: number;
    },
  ): Promise<PendingOperation>;
  getAll(): Promise<PendingOperation[]>;
  remove(id: string): Promise<void>;
  count(): Promise<number>;
  clear(): Promise<void>;
}
