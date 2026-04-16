import { describe, expect, it, vi } from "vitest";
import { notifyFamilyOnEventChange } from "@/application/services/notifyFamilyOnEventChange";
import { Family } from "@/domain/entities/Family";
import type { IPushNotificationService } from "@/application/services/IPushNotificationService";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

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

function makeFamilyWithMembers(ownerUserId: string, memberUserId: string): Family {
  return new Family({
    createdBy: ownerUserId,
    id: "family-1",
    name: "Test",
    members: [
      { userId: ownerUserId, role: "owner", colorPalette: null, delegatedByUserId: null },
      { userId: memberUserId, role: "member", colorPalette: null, delegatedByUserId: null },
    ],
  });
}

describe("notifyFamilyOnEventChange", () => {
  it("sends a notification to all family members except the actor", async () => {
    const familyRepo = createFamilyRepository();
    const pushRepo = createPushSubscriptionRepository();
    const pushService = createPushNotificationService();

    const subscription = {
      endpoint: "https://push.example.com/1",
      keysAuth: "auth",
      keysP256dh: "p256dh",
      userId: "member-1",
    };

    vi.mocked(familyRepo.findById).mockResolvedValue(
      makeFamilyWithMembers("owner-1", "member-1"),
    );
    vi.mocked(pushRepo.findByUserIds).mockResolvedValue([subscription]);
    vi.mocked(pushService.sendNotification).mockResolvedValue(undefined);

    await notifyFamilyOnEventChange(
      "owner-1",
      "family-1",
      "Work shift",
      "created",
      "2026-06-15",
      familyRepo,
      pushRepo,
      pushService,
    );

    expect(pushRepo.findByUserIds).toHaveBeenCalledWith(["member-1"]);
    expect(pushService.sendNotification).toHaveBeenCalledTimes(1);
    expect(pushService.sendNotification).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        body: 'El evento "Work shift" ha sido creado.',
      }),
    );
  });

  it("does nothing when the family does not exist", async () => {
    const familyRepo = createFamilyRepository();
    const pushRepo = createPushSubscriptionRepository();
    const pushService = createPushNotificationService();

    vi.mocked(familyRepo.findById).mockResolvedValue(null);

    await notifyFamilyOnEventChange(
      "owner-1",
      "family-1",
      "Work shift",
      "created",
      undefined,
      familyRepo,
      pushRepo,
      pushService,
    );

    expect(pushRepo.findByUserIds).not.toHaveBeenCalled();
    expect(pushService.sendNotification).not.toHaveBeenCalled();
  });

  it("does nothing when the actor is the only family member", async () => {
    const familyRepo = createFamilyRepository();
    const pushRepo = createPushSubscriptionRepository();
    const pushService = createPushNotificationService();

    vi.mocked(familyRepo.findById).mockResolvedValue(
      new Family({ createdBy: "owner-1", id: "family-1", name: "Solo" }),
    );

    await notifyFamilyOnEventChange(
      "owner-1",
      "family-1",
      "Work shift",
      "updated",
      undefined,
      familyRepo,
      pushRepo,
      pushService,
    );

    expect(pushRepo.findByUserIds).not.toHaveBeenCalled();
  });

  it("sends a deleted notification with correct body", async () => {
    const familyRepo = createFamilyRepository();
    const pushRepo = createPushSubscriptionRepository();
    const pushService = createPushNotificationService();

    vi.mocked(familyRepo.findById).mockResolvedValue(
      makeFamilyWithMembers("owner-1", "member-1"),
    );
    vi.mocked(pushRepo.findByUserIds).mockResolvedValue([
      {
        endpoint: "https://push.example.com/1",
        keysAuth: "auth",
        keysP256dh: "p256dh",
        userId: "member-1",
      },
    ]);
    vi.mocked(pushService.sendNotification).mockResolvedValue(undefined);

    await notifyFamilyOnEventChange(
      "owner-1",
      "family-1",
      "Night shift",
      "deleted",
      undefined,
      familyRepo,
      pushRepo,
      pushService,
    );

    expect(pushService.sendNotification).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: 'El evento "Night shift" ha sido eliminado.',
      }),
    );
  });
});
