import type { IPushNotificationService, PushNotificationPayload } from "@/application/services/IPushNotificationService";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

export type EventChangeType = "created" | "updated" | "deleted";

export interface SendEventNotificationInput {
  /** User IDs of the family members to notify (typically all members except the actor). */
  recipientUserIds: string[];
  eventTitle: string;
  eventChangeType: EventChangeType;
  /** ISO date string for the relevant calendar day */
  eventDate?: string;
}

export type SendEventNotificationResult = { success: true; sent: number };

function buildPayload(
  title: string,
  changeType: EventChangeType,
  date: string | undefined,
): PushNotificationPayload {
  const verbMap: Record<EventChangeType, string> = {
    created: "creado",
    deleted: "eliminado",
    updated: "actualizado",
  };

  const url = date ? `/calendar?date=${date}` : "/calendar";

  return {
    body: `El evento "${title}" ha sido ${verbMap[changeType]}.`,
    date,
    title: "Personal Work Shift",
    url,
  };
}

export class SendEventNotification {
  constructor(
    private readonly pushSubscriptionRepository: IPushSubscriptionRepository,
    private readonly pushNotificationService: IPushNotificationService,
  ) {}

  async execute(
    input: SendEventNotificationInput,
  ): Promise<SendEventNotificationResult> {
    if (input.recipientUserIds.length === 0) {
      return { sent: 0, success: true };
    }

    const subscriptions = await this.pushSubscriptionRepository.findByUserIds(
      input.recipientUserIds,
    );

    if (subscriptions.length === 0) {
      return { sent: 0, success: true };
    }

    const payload = buildPayload(
      input.eventTitle,
      input.eventChangeType,
      input.eventDate,
    );

    let sent = 0;

    for (const subscription of subscriptions) {
      try {
        await this.pushNotificationService.sendNotification(
          subscription,
          payload,
        );
        sent++;
      } catch (error) {
        // Log but don't throw — a failed notification must not break event operations.
        console.error(
          `[SendEventNotification] Failed to send push to ${subscription.userId}:`,
          error,
        );
      }
    }

    return { sent, success: true };
  }
}
