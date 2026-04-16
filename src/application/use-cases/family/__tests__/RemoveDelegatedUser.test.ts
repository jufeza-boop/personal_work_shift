import { describe, expect, it, vi } from "vitest";
import { RemoveDelegatedUser } from "@/application/use-cases/family/RemoveDelegatedUser";
import { Family } from "@/domain/entities/Family";
import { User } from "@/domain/entities/User";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

function createUserRepository(): IUserRepository {
  return {
    delete: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findDelegatedUsers: vi.fn(),
    save: vi.fn(),
  };
}

describe("RemoveDelegatedUser", () => {
  it("removes the delegated user from all families and deletes the user record", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "parent-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });
    const family = new Family({
      createdBy: "parent-1",
      id: "family-1",
      members: [
        {
          delegatedByUserId: "parent-1",
          role: "delegated",
          userId: "delegated-1",
        },
      ],
      name: "Home Team",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);
    vi.mocked(familyRepository.findByUserId).mockResolvedValue([family]);

    const useCase = new RemoveDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      parentId: "parent-1",
    });

    expect(result).toEqual({ success: true });
    expect(familyRepository.save).toHaveBeenCalledOnce();

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    expect(savedFamily.hasMember("delegated-1")).toBe(false);
    expect(userRepository.delete).toHaveBeenCalledWith("delegated-1");
  });

  it("returns USER_NOT_FOUND when the delegated user does not exist", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new RemoveDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      delegatedUserId: "nonexistent",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "Delegated user not found",
      },
      success: false,
    });
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN when the requester is not the parent", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "real-parent",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);

    const useCase = new RemoveDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      parentId: "attacker",
    });

    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "You are not the parent of this delegated user",
      },
      success: false,
    });
    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
