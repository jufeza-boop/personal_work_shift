import { describe, expect, it, vi } from "vitest";
import {
  formatDate,
  SendEventNotification,
} from "@/application/use-cases/push/SendEventNotification";
import type { IPushNotificationService } from "@/application/services/IPushNotificationService";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

describe("formatDate", () => {
  it("converts YYYY-MM-DD to DD/MM/YYYY", () => {
    expect(formatDate("2026-06-15")).toBe("15/06/2026");
  });

  it("preserves zero-padded single-digit months and days", () => {
    expect(formatDate("2026-01-05")).toBe("05/01/2026");
  });

  it("returns the raw input when the format is invalid", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
    expect(formatDate("2026-06")).toBe("2026-06");
    expect(formatDate("")).toBe("");
  });
});

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
      body: 'El evento "Work shift" ha sido creado el 15/06/2026.',
      date: "2026-06-15",
      title: "Evento creado",
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
        title: "Evento actualizado",
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
        title: "Evento eliminado",
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
