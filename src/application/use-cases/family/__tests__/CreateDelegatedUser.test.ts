import { describe, expect, it, vi } from "vitest";
import { CreateDelegatedUser } from "@/application/use-cases/family/CreateDelegatedUser";
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
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

describe("CreateDelegatedUser", () => {
  it("creates a delegated user and adds them to the family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "parent-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      displayName: "Junior",
      familyId: "family-1",
      parentId: "parent-1",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.delegatedUser.displayName).toBe("Junior");
      expect(result.data.delegatedUser.delegatedByUserId).toBe("parent-1");
      expect(result.data.delegatedUser.isDelegated()).toBe(true);
    }

    expect(userRepository.save).toHaveBeenCalledOnce();
    expect(familyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "family-1",
      }),
    );

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    const delegatedMember = savedFamily.members.find(
      (m) => m.delegatedByUserId === "parent-1",
    );
    expect(delegatedMember).toBeDefined();
    expect(delegatedMember?.role).toBe("delegated");
  });

  it("creates a delegated user with a color palette", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "parent-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      displayName: "Junior",
      familyId: "family-1",
      parentId: "parent-1",
    });

    expect(result.success).toBe(true);
    expect(familyRepository.save).toHaveBeenCalledOnce();

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    const delegatedMember = savedFamily.members.find(
      (m) => m.delegatedByUserId === "parent-1",
    );
    expect(delegatedMember?.colorPalette?.name).toBe("sky");
  });

  it("throws when color palette is already taken in the family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "parent-1",
      id: "family-1",
      members: [
        {
          colorPalette: ColorPalette.create("sky"),
          role: "member",
          userId: "member-1",
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);

    await expect(
      useCase.execute({
        colorPalette: "sky",
        displayName: "Junior",
        familyId: "family-1",
        parentId: "parent-1",
      }),
    ).rejects.toThrow();
  });

  it("returns INVALID_DISPLAY_NAME when display name is empty", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      displayName: "   ",
      familyId: "family-1",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "INVALID_DISPLAY_NAME",
        message: "Display name cannot be empty",
      },
      success: false,
    });
    expect(familyRepository.findById).not.toHaveBeenCalled();
  });

  it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      displayName: "Junior",
      familyId: "missing-family",
      parentId: "parent-1",
    });

    expect(result).toEqual({
      error: {
        code: "FAMILY_NOT_FOUND",
        message: "The specified family does not exist",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("returns NOT_A_FAMILY_MEMBER when parent is not in the family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "other-owner",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new CreateDelegatedUser(userRepository, familyRepository);
    const result = await useCase.execute({
      displayName: "Junior",
      familyId: "family-1",
      parentId: "non-member",
    });

    expect(result).toEqual({
      error: {
        code: "NOT_A_FAMILY_MEMBER",
        message: "The parent must be a member of the family",
      },
      success: false,
    });
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
