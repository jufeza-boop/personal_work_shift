import { SendEventNotification } from "@/application/use-cases/push/SendEventNotification";
import type { EventChangeType } from "@/application/use-cases/push/SendEventNotification";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IPushNotificationService } from "@/application/services/IPushNotificationService";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

/**
 * Sends push notifications to all family members (except the actor) when an
 * event is created, updated, or deleted.
 *
 * Failures are logged but never propagated so they cannot break event operations.
 */
export async function notifyFamilyOnEventChange(
  actorUserId: string,
  familyId: string,
  eventTitle: string,
  changeType: EventChangeType,
  eventDate: string | undefined,
  familyRepository: IFamilyRepository,
  pushSubscriptionRepository: IPushSubscriptionRepository,
  pushNotificationService: IPushNotificationService,
): Promise<void> {
  const family = await familyRepository.findById(familyId);

  if (!family) return;

  const recipientIds = family.members
    .map((m) => m.userId)
    .filter((id) => id !== actorUserId);

  if (recipientIds.length === 0) return;

  const useCase = new SendEventNotification(
    pushSubscriptionRepository,
    pushNotificationService,
  );

  await useCase.execute({
    eventChangeType: changeType,
    eventDate,
    eventTitle,
    recipientUserIds: recipientIds,
  });
}
