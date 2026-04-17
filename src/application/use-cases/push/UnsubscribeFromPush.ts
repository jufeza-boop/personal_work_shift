import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

export interface UnsubscribeFromPushInput {
  userId: string;
  endpoint: string;
}

export type UnsubscribeFromPushResult = { success: true };

export class UnsubscribeFromPush {
  constructor(
    private readonly pushSubscriptionRepository: IPushSubscriptionRepository,
  ) {}

  async execute(
    input: UnsubscribeFromPushInput,
  ): Promise<UnsubscribeFromPushResult> {
    await this.pushSubscriptionRepository.remove(input.userId, input.endpoint);

    return { success: true };
  }
}
