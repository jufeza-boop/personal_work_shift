"use client";

import { usePushNotifications } from "@/presentation/hooks/usePushNotifications";

export function NotificationOptIn() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported || permission === "denied") {
    return null;
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/60 px-4 py-2 text-sm text-slate-600">
        <span>🔔 Notificaciones activas</span>
        <button
          onClick={() => void unsubscribe()}
          disabled={isLoading}
          className="ml-auto text-xs text-slate-400 underline hover:text-slate-600 disabled:opacity-50"
          type="button"
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/60 px-4 py-2 text-sm text-slate-600">
      <span>🔕 Activa las notificaciones para recibir avisos de cambios.</span>
      <button
        onClick={() => void subscribe()}
        disabled={isLoading}
        className="ml-auto rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        type="button"
      >
        {isLoading ? "..." : "Activar"}
      </button>
    </div>
  );
}
