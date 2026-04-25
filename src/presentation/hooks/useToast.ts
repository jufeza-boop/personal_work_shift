"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export function useToast(durationMs = 3500) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timeoutIds = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Clean up all pending timeouts on unmount
  useEffect(() => {
    const ids = timeoutIds.current;

    return () => {
      ids.forEach((timeoutId) => clearTimeout(timeoutId));
      ids.clear();
    };
  }, []);

  const removeToast = useCallback((id: number) => {
    const existingTimeout = timeoutIds.current.get(id);

    if (existingTimeout !== undefined) {
      clearTimeout(existingTimeout);
      timeoutIds.current.delete(id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = nextId.current++;

      setToasts((prev) => [...prev, { id, message, type }]);

      const timeoutId = setTimeout(() => {
        timeoutIds.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);

      timeoutIds.current.set(id, timeoutId);
    },
    [durationMs],
  );

  return { addToast, removeToast, toasts };
}

export function useSuccessToast(
  success: boolean,
  message: string,
  addToast: (message: string, type: Toast["type"]) => void,
) {
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (success && !prevSuccess.current) {
      addToast(message, "success");
    }

    prevSuccess.current = success;
  }, [success, message, addToast]);
}
