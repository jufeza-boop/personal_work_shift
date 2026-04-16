import { describe, expect, it, vi } from "vitest";
import { SubscribeToPush } from "@/application/use-cases/push/SubscribeToPush";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

function createPushSubscriptionRepository(): IPushSubscriptionRepository {
  return {
    findByUserId: vi.fn(),
    findByUserIds: vi.fn(),
    remove: vi.fn(),
    save: vi.fn(),
  };
}

describe("SubscribeToPush", () => {
  it("saves the subscription and returns success", async () => {
    const repo = createPushSubscriptionRepository();
    vi.mocked(repo.save).mockResolvedValue(undefined);

    const useCase = new SubscribeToPush(repo);
    const result = await useCase.execute({
      endpoint: "https://push.example.com/sub/123",
      keysAuth: "auth-key",
      keysP256dh: "p256dh-key",
      userId: "user-1",
    });

    expect(result.success).toBe(true);
    expect(repo.save).toHaveBeenCalledWith({
      endpoint: "https://push.example.com/sub/123",
      keysAuth: "auth-key",
      keysP256dh: "p256dh-key",
      userId: "user-1",
    });
  });

  it("returns INVALID_SUBSCRIPTION when endpoint is empty", async () => {
    const repo = createPushSubscriptionRepository();
    const useCase = new SubscribeToPush(repo);

    const result = await useCase.execute({
      endpoint: "",
      keysAuth: "auth-key",
      keysP256dh: "p256dh-key",
      userId: "user-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_SUBSCRIPTION");
    }
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("returns INVALID_SUBSCRIPTION when userId is empty", async () => {
    const repo = createPushSubscriptionRepository();
    const useCase = new SubscribeToPush(repo);

    const result = await useCase.execute({
      endpoint: "https://push.example.com/sub/123",
      keysAuth: "auth-key",
      keysP256dh: "p256dh-key",
      userId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_SUBSCRIPTION");
    }
  });
});
