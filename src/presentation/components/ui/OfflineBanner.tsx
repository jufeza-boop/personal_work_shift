"use client";

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

export function OfflineBanner({
  isOnline,
  isSyncing,
  pendingCount,
}: OfflineBannerProps) {
  if (!isOnline) {
    return (
      <div
        role="status"
        className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-800"
      >
        Sin conexión — los cambios se sincronizarán cuando vuelva la red
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div
        role="status"
        className="rounded-lg bg-indigo-100 px-4 py-2 text-sm text-indigo-800"
      >
        Sincronizando cambios pendientes...
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div
        role="status"
        className="rounded-lg bg-yellow-100 px-4 py-2 text-sm text-yellow-800"
      >
        {pendingCount} cambios pendientes de sincronizar
      </div>
    );
  }

  return null;
}
