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

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = nextId.current++;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    },
    [durationMs],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
