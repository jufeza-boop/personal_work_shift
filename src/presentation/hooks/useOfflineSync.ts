"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IOfflineQueue,
  PendingOperation,
} from "@/application/services/IOfflineQueue";

export interface UseOfflineSyncOptions {
  queue: IOfflineQueue;
  processOperation: (op: PendingOperation) => Promise<void>;
  onSyncComplete?: () => void;
}

export interface UseOfflineSyncResult {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  enqueueOperation: (
    op: Pick<PendingOperation, "type" | "formFields">,
  ) => Promise<void>;
  syncNow: () => Promise<void>;
}

export function useOfflineSync({
  queue,
  processOperation,
  onSyncComplete,
}: UseOfflineSyncOptions): UseOfflineSyncResult {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    const c = await queue.count();
    setPendingCount(c);
  }, [queue]);

  const syncQueue = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    let processedAny = false;
    try {
      const ops = await queue.getAll();
      for (const op of ops) {
        processedAny = true;
        try {
          await processOperation(op);
          await queue.remove(op.id);
        } catch (error) {
          console.error("[useOfflineSync] Failed to process operation:", error);
          await queue.remove(op.id);
          await queue.enqueue({
            type: op.type,
            formFields: op.formFields,
            retryCount: op.retryCount + 1,
          });
        }
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      await refreshCount();
      if (processedAny) onSyncComplete?.();
    }
  }, [queue, processOperation, refreshCount, onSyncComplete]);

  const enqueueOperation = useCallback(
    async (op: Pick<PendingOperation, "type" | "formFields">) => {
      await queue.enqueue(op);
      await refreshCount();
    },
    [queue, refreshCount],
  );

  const syncNow = useCallback(async () => {
    await syncQueue();
  }, [syncQueue]);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const online = navigator.onLine;
    setIsOnline(online);

    // Sync any pending items that accumulated while the device was offline
    // (e.g. the user refreshes the page and is already online).
    if (online) {
      void syncQueue();
    }

    const handleOnline = () => {
      setIsOnline(true);
      void syncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncQueue]);

  return { isOnline, pendingCount, isSyncing, enqueueOperation, syncNow };
}
