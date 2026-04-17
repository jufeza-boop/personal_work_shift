import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IPushSubscriptionRepository,
  PushSubscription,
} from "@/domain/repositories/IPushSubscriptionRepository";
import type { Database } from "@/infrastructure/supabase/database.types";

function mapRow(row: {
  user_id: string;
  endpoint: string;
  keys_auth: string;
  keys_p256dh: string;
}): PushSubscription {
  return {
    endpoint: row.endpoint,
    keysAuth: row.keys_auth,
    keysP256dh: row.keys_p256dh,
    userId: row.user_id,
  };
}

export class SupabasePushSubscriptionRepository implements IPushSubscriptionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async save(subscription: PushSubscription): Promise<void> {
    const { error } = await this.client.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        keys_auth: subscription.keysAuth,
        keys_p256dh: subscription.keysP256dh,
        user_id: subscription.userId,
      },
      { onConflict: "user_id,endpoint" },
    );

    if (error) {
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    const { data, error } = await this.client
      .from("push_subscriptions")
      .select("user_id, endpoint, keys_auth, keys_p256dh")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRow);
  }

  async findByUserIds(userIds: string[]): Promise<PushSubscription[]> {
    if (userIds.length === 0) return [];

    const { data, error } = await this.client
      .from("push_subscriptions")
      .select("user_id, endpoint, keys_auth, keys_p256dh")
      .in("user_id", userIds);

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRow);
  }

  async remove(userId: string, endpoint: string): Promise<void> {
    const { error } = await this.client
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("endpoint", endpoint);

    if (error) {
      throw error;
    }
  }
}
