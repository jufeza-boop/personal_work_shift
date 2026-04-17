import type { PushSubscription } from "@/domain/repositories/IPushSubscriptionRepository";

export interface PushNotificationPayload {
  title: string;
  body: string;
  /** ISO date string for the relevant calendar day (e.g. "2026-06-15") */
  date?: string;
  /** URL to open when the notification is clicked */
  url?: string;
}

export interface IPushNotificationService {
  sendNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
  ): Promise<void>;
}
