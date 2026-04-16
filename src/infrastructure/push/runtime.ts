import type { IPushNotificationService } from "@/application/services/IPushNotificationService";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";
import { isMockAuthEnabled } from "@/infrastructure/auth/runtime";
import { SupabasePushSubscriptionRepository } from "@/infrastructure/push/SupabasePushSubscriptionRepository";
import { WebPushService } from "@/infrastructure/push/WebPushService";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

/** No-op push notification service used in mock/test environments. */
class NullPushNotificationService implements IPushNotificationService {
  async sendNotification(): Promise<void> {
    // intentional no-op in mock mode
  }
}

/** No-op push subscription repository used in mock/test environments. */
class NullPushSubscriptionRepository implements IPushSubscriptionRepository {
  async save(): Promise<void> {}
  async findByUserId(): Promise<[]> {
    return [];
  }
  async findByUserIds(): Promise<[]> {
    return [];
  }
  async remove(): Promise<void> {}
}

export function vapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
}

export async function createServerPushDependencies(): Promise<{
  pushSubscriptionRepository: IPushSubscriptionRepository;
  pushNotificationService: IPushNotificationService;
}> {
  if (isMockAuthEnabled()) {
    return {
      pushNotificationService: new NullPushNotificationService(),
      pushSubscriptionRepository: new NullPushSubscriptionRepository(),
    };
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    // Return no-ops when VAPID keys are not configured so the app does not crash.
    return {
      pushNotificationService: new NullPushNotificationService(),
      pushSubscriptionRepository: new NullPushSubscriptionRepository(),
    };
  }

  const supabase = await createServerSupabaseClient();

  return {
    pushNotificationService: new WebPushService({
      vapidPrivateKey: privateKey,
      vapidPublicKey: publicKey,
      vapidSubject: subject,
    }),
    pushSubscriptionRepository: new SupabasePushSubscriptionRepository(supabase),
  };
}
