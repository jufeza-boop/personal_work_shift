import { describe, expect, it, vi } from "vitest";
import { CreateDelegatedUser } from "@/application/use-cases/family/CreateDelegatedUser";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createUserRepository(): IUserRepository {
  return {
    delete: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findDelegatedUsers: vi.fn(),
    save: vi.fn(),
  };
}

describe("CreateDelegatedUser", () => {
  it("creates a delegated user owned by the parent", async () => {
    const userRepository = createUserRepository();
    const useCase = new CreateDelegatedUser(userRepository);

    const result = await useCase.execute({
      displayName: "Junior",
      parentId: "parent-1",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.delegatedUser.displayName).toBe("Junior");
      expect(result.data.delegatedUser.delegatedByUserId).toBe("parent-1");
      expect(result.data.delegatedUser.isDelegated()).toBe(true);
    }

    expect(userRepository.save).toHaveBeenCalledOnce();
  });

  it("returns INVALID_DISPLAY_NAME when display name is empty", async () => {
    const userRepository = createUserRepository();
    const useCase = new CreateDelegatedUser(userRepository);

    const result = await useCase.execute({
      displayName: "   ",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "INVALID_DISPLAY_NAME",
        message: "Display name cannot be empty",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
