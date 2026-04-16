import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

export interface SubscribeToPushInput {
  userId: string;
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;
}

export type SubscribeToPushResult =
  | { success: true }
  | { success: false; error: { code: "INVALID_SUBSCRIPTION"; message: string } };

export class SubscribeToPush {
  constructor(
    private readonly pushSubscriptionRepository: IPushSubscriptionRepository,
  ) {}

  async execute(input: SubscribeToPushInput): Promise<SubscribeToPushResult> {
    if (!input.userId || !input.endpoint || !input.keysAuth || !input.keysP256dh) {
      return {
        error: {
          code: "INVALID_SUBSCRIPTION",
          message: "All subscription fields are required",
        },
        success: false,
      };
    }

    await this.pushSubscriptionRepository.save({
      endpoint: input.endpoint,
      keysAuth: input.keysAuth,
      keysP256dh: input.keysP256dh,
      userId: input.userId,
    });

    return { success: true };
  }
}
