import webpush from "web-push";
import type { IPushNotificationService, PushNotificationPayload } from "@/application/services/IPushNotificationService";
import type { PushSubscription } from "@/domain/repositories/IPushSubscriptionRepository";

interface WebPushServiceConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
}

export class WebPushService implements IPushNotificationService {
  constructor(config: WebPushServiceConfig) {
    webpush.setVapidDetails(
      config.vapidSubject,
      config.vapidPublicKey,
      config.vapidPrivateKey,
    );
  }

  async sendNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload,
  ): Promise<void> {
    const pushSubscription: webpush.PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keysAuth,
        p256dh: subscription.keysP256dh,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
    );
  }
}
