import { describe, expect, it, vi } from "vitest";
import { RenameDelegatedUser } from "@/application/use-cases/family/RenameDelegatedUser";
import { User } from "@/domain/entities/User";
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

describe("RenameDelegatedUser", () => {
  it("renames the delegated user and saves", async () => {
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "parent-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);

    const useCase = new RenameDelegatedUser(userRepository);
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      displayName: "Junior Updated",
      parentId: "parent-1",
    });

    expect(result).toEqual({ success: true });
    expect(userRepository.save).toHaveBeenCalledOnce();

    const savedUser = vi.mocked(userRepository.save).mock.calls[0]?.[0] as User;
    expect(savedUser.displayName).toBe("Junior Updated");
  });

  it("returns USER_NOT_FOUND when the delegated user does not exist", async () => {
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new RenameDelegatedUser(userRepository);
    const result = await useCase.execute({
      delegatedUserId: "nonexistent",
      displayName: "New Name",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "Delegated user not found",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN when the requester is not the parent", async () => {
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "real-parent",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);

    const useCase = new RenameDelegatedUser(userRepository);
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      displayName: "Hacked Name",
      parentId: "attacker",
    });

    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "You are not the parent of this delegated user",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("returns INVALID_DISPLAY_NAME when the name is empty", async () => {
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "parent-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);

    const useCase = new RenameDelegatedUser(userRepository);
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
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

  it("returns NOT_DELEGATED when the user is not a delegated user", async () => {
    const userRepository = createUserRepository();
    const regularUser = new User({
      displayName: "Regular",
      email: "regular@example.com",
      id: "user-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(regularUser);

    const useCase = new RenameDelegatedUser(userRepository);
    const result = await useCase.execute({
      delegatedUserId: "user-1",
      displayName: "Hacked",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "NOT_DELEGATED",
        message: "The specified user is not a delegated user",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
