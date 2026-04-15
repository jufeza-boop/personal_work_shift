"use client";

import { useEffect, useRef } from "react";
import type { SerializedEvent } from "@/application/services/calendarUtils";
import type { IRealtimeService } from "@/application/services/IRealtimeService";

export interface UseRealtimeSyncOptions {
  service: IRealtimeService;
  familyId: string;
  onInsert: (event: SerializedEvent) => void;
  onUpdate: (event: SerializedEvent) => void;
  onDelete: (eventId: string) => void;
}

/**
 * Manages a Supabase Realtime subscription for the `events` table.
 *
 * The hook subscribes when the `familyId` changes and unsubscribes on
 * cleanup. Handler callbacks are kept in a ref so they always reflect the
 * latest closure without triggering unnecessary re-subscriptions.
 */
export function useRealtimeSync({
  service,
  familyId,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSyncOptions): void {
  // Keep handler callbacks in a ref so the subscription effect below only
  // re-runs when `service` or `familyId` changes – not on every render.
  const handlersRef = useRef({ onDelete, onInsert, onUpdate });

  useEffect(() => {
    handlersRef.current = { onDelete, onInsert, onUpdate };
  });

  useEffect(() => {
    service.subscribe(familyId, {
      onDelete: (id) => handlersRef.current.onDelete(id),
      onInsert: (event) => handlersRef.current.onInsert(event),
      onUpdate: (event) => handlersRef.current.onUpdate(event),
    });

    return () => {
      service.unsubscribe();
    };
  }, [service, familyId]);
}
