"use client";

import { CheckCircle, XCircle } from "lucide-react";
import type { Toast } from "@/presentation/hooks/useToast";

interface ToastListProps {
  onRemove: (id: number) => void;
  toasts: Toast[];
}

export function ToastList({ toasts, onRemove }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed right-6 bottom-6 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => onRemove(toast.id)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
