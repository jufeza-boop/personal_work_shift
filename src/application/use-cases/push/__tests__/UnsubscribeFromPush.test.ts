import { describe, expect, it, vi } from "vitest";
import { UnsubscribeFromPush } from "@/application/use-cases/push/UnsubscribeFromPush";
import type { IPushSubscriptionRepository } from "@/domain/repositories/IPushSubscriptionRepository";

function createPushSubscriptionRepository(): IPushSubscriptionRepository {
  return {
    findByUserId: vi.fn(),
    findByUserIds: vi.fn(),
    remove: vi.fn(),
    save: vi.fn(),
  };
}

describe("UnsubscribeFromPush", () => {
  it("removes the subscription and returns success", async () => {
    const repo = createPushSubscriptionRepository();
    vi.mocked(repo.remove).mockResolvedValue(undefined);

    const useCase = new UnsubscribeFromPush(repo);
    const result = await useCase.execute({
      endpoint: "https://push.example.com/sub/123",
      userId: "user-1",
    });

    expect(result.success).toBe(true);
    expect(repo.remove).toHaveBeenCalledWith(
      "user-1",
      "https://push.example.com/sub/123",
    );
  });
});
