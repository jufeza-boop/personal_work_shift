"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/presentation/hooks/usePushNotifications";

export function NotificationBell() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-dismiss status message after 3 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    if (isSubscribed) {
      await unsubscribe();
      setStatusMessage("Notificaciones inactivas");
    } else {
      await subscribe();
      setStatusMessage("Notificaciones activas");
    }
  }, [isLoading, isSubscribed, subscribe, unsubscribe]);

  if (!isSupported || permission === "denied") {
    return null;
  }

  return (
    <div className="relative">
      <button
        aria-label={
          isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"
        }
        aria-pressed={isSubscribed}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-stone-100 hover:text-slate-900 disabled:opacity-50"
        disabled={isLoading}
        onClick={() => void handleClick()}
        type="button"
      >
        {isSubscribed ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>

      {statusMessage && (
        <div
          aria-live="polite"
          className="absolute top-full right-0 z-50 mt-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs whitespace-nowrap text-slate-700 shadow-md"
          role="status"
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
