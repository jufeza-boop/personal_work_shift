"use client";

import { useCallback, useEffect, useState } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

/**
 * Converts a base64url-encoded VAPID public key string to the ArrayBuffer format
 * required by PushManager.subscribe()'s applicationServerKey option.
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/vapid-public-key");

    if (!res.ok) return null;

    const data = (await res.json()) as { vapidPublicKey?: string };

    return data.vapidPublicKey ?? null;
  } catch {
    return null;
  }
}

async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;

  return registration.pushManager.getSubscription();
}

export function usePushNotifications(): UsePushNotificationsResult {
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? (Notification.permission as NotificationPermission) : "denied",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return;

    void getExistingSubscription().then((sub) => {
      setIsSubscribed(sub !== null);
    });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const vapidKey = await fetchVapidPublicKey();

      if (!vapidKey) {
        console.error("[usePushNotifications] VAPID public key not available");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      setPermission(perm as NotificationPermission);

      if (perm !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
        userVisibleOnly: true,
      });

      const subJson = subscription.toJSON();

      await fetch("/api/push/subscribe", {
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            auth: subJson.keys?.auth ?? "",
            p256dh: subJson.keys?.p256dh ?? "",
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("[usePushNotifications] Failed to subscribe:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);

    try {
      const subscription = await getExistingSubscription();

      if (!subscription) return;

      await fetch("/api/push/unsubscribe", {
        body: JSON.stringify({ endpoint: subscription.endpoint }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      await subscription.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error("[usePushNotifications] Failed to unsubscribe:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isLoading,
    isSubscribed,
    isSupported,
    permission,
    subscribe,
    unsubscribe,
  };
}
