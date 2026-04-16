import { describe, expect, it, vi } from "vitest";
import { SendEventNotification } from "@/application/use-cases/push/SendEventNotification";
import type { IPushNotificationService } from "@/application/services/IPushNotificationService";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

function createPushSubscriptionRepository(): IPushSubscriptionRepository {
  return {
    findByUserId: vi.fn(),
    findByUserIds: vi.fn(),
    remove: vi.fn(),
    save: vi.fn(),
  };
}

function createPushNotificationService(): IPushNotificationService {
  return {
    sendNotification: vi.fn(),
  };
}

const subscription = {
  endpoint: "https://push.example.com/sub/abc",
  keysAuth: "auth",
  keysP256dh: "p256dh",
  userId: "user-2",
};

describe("SendEventNotification", () => {
  it("returns sent=0 when recipient list is empty", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    const useCase = new SendEventNotification(repo, service);

    const result = await useCase.execute({
      eventChangeType: "created",
      eventTitle: "Work shift",
      recipientUserIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.sent).toBe(0);
    expect(repo.findByUserIds).not.toHaveBeenCalled();
  });

  it("returns sent=0 when no subscriptions found", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    vi.mocked(repo.findByUserIds).mockResolvedValue([]);

    const useCase = new SendEventNotification(repo, service);
    const result = await useCase.execute({
      eventChangeType: "created",
      eventTitle: "Work shift",
      recipientUserIds: ["user-2"],
    });

    expect(result.success).toBe(true);
    expect(result.sent).toBe(0);
    expect(service.sendNotification).not.toHaveBeenCalled();
  });

  it("sends a notification for each subscription and returns sent count", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    vi.mocked(repo.findByUserIds).mockResolvedValue([subscription]);
    vi.mocked(service.sendNotification).mockResolvedValue(undefined);

    const useCase = new SendEventNotification(repo, service);
    const result = await useCase.execute({
      eventChangeType: "created",
      eventDate: "2026-06-15",
      eventTitle: "Work shift",
      recipientUserIds: ["user-2"],
    });

    expect(result.success).toBe(true);
    expect(result.sent).toBe(1);
    expect(service.sendNotification).toHaveBeenCalledWith(subscription, {
      body: 'El evento "Work shift" ha sido creado.',
      date: "2026-06-15",
      title: "Personal Work Shift",
      url: "/calendar?date=2026-06-15",
    });
  });

  it("builds the correct body for updated events", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    vi.mocked(repo.findByUserIds).mockResolvedValue([subscription]);
    vi.mocked(service.sendNotification).mockResolvedValue(undefined);

    const useCase = new SendEventNotification(repo, service);
    await useCase.execute({
      eventChangeType: "updated",
      eventTitle: "Night shift",
      recipientUserIds: ["user-2"],
    });

    expect(service.sendNotification).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        body: 'El evento "Night shift" ha sido actualizado.',
        url: "/calendar",
      }),
    );
  });

  it("builds the correct body for deleted events", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    vi.mocked(repo.findByUserIds).mockResolvedValue([subscription]);
    vi.mocked(service.sendNotification).mockResolvedValue(undefined);

    const useCase = new SendEventNotification(repo, service);
    await useCase.execute({
      eventChangeType: "deleted",
      eventTitle: "Morning shift",
      recipientUserIds: ["user-2"],
    });

    expect(service.sendNotification).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        body: 'El evento "Morning shift" ha sido eliminado.',
      }),
    );
  });

  it("continues sending to other subscriptions even if one fails", async () => {
    const repo = createPushSubscriptionRepository();
    const service = createPushNotificationService();
    const sub2 = { ...subscription, userId: "user-3" };
    vi.mocked(repo.findByUserIds).mockResolvedValue([subscription, sub2]);
    vi.mocked(service.sendNotification)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(undefined);

    const useCase = new SendEventNotification(repo, service);
    const result = await useCase.execute({
      eventChangeType: "created",
      eventTitle: "Work shift",
      recipientUserIds: ["user-2", "user-3"],
    });

    expect(result.success).toBe(true);
    expect(result.sent).toBe(1);
    expect(service.sendNotification).toHaveBeenCalledTimes(2);
  });
});
