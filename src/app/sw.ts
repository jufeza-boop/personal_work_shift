/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Push notification handling
self.addEventListener("push", (event: PushEvent) => {
  let title = "Personal Work Shift";
  let body = "Tienes una actualización en tu calendario.";
  let url = "/calendar";

  if (event.data) {
    try {
      const data = event.data.json() as {
        title?: string;
        body?: string;
        url?: string;
      };
      if (data.title) title = data.title;
      if (data.body) body = data.body;
      if (data.url) url = data.url;
    } catch {
      // If parsing fails, use defaults
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/pwa-192.png",
      badge: "/icons/pwa-192.png",
      data: { url },
    }),
  );
});

// Open the app at the relevant calendar day when a notification is clicked
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data as { url?: string } | null;
  const targetUrl = notificationData?.url ?? "/calendar";

  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            void (client as WindowClient).navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
