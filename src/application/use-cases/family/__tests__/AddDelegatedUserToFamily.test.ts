import { describe, expect, it, vi } from "vitest";
import { AddDelegatedUserToFamily } from "@/application/use-cases/family/AddDelegatedUserToFamily";
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

describe("AddDelegatedUserToFamily", () => {
  it("adds an existing delegated user to the family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "owner-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);
    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({ success: true });
    expect(familyRepository.save).toHaveBeenCalledOnce();

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    expect(savedFamily.hasMember("delegated-1")).toBe(true);
  });

  it("returns USER_NOT_FOUND when the delegated user does not exist", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "nonexistent",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "Delegated user not found",
      },
      success: false,
    });
  });

  it("returns FORBIDDEN when the requester is not the parent of the delegated user", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "real-parent",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      familyId: "family-1",
      requesterUserId: "attacker",
    });

    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "You are not the parent of this delegated user",
      },
      success: false,
    });
  });

  it("returns NOT_DELEGATED when the user is not a delegated user", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const regularUser = new User({
      displayName: "Regular",
      email: "regular@example.com",
      id: "user-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(regularUser);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "user-1",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "NOT_DELEGATED",
        message: "The specified user is not a delegated user",
      },
      success: false,
    });
  });

  it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "owner-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);
    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      familyId: "nonexistent",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "FAMILY_NOT_FOUND",
        message: "The specified family does not exist",
      },
      success: false,
    });
  });

  it("returns MEMBER_ALREADY_EXISTS when the delegated user is already in the family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const delegatedUser = new User({
      delegatedByUserId: "owner-1",
      displayName: "Junior",
      email: "delegated-abc@pws.local",
      id: "delegated-1",
    });
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          delegatedByUserId: "owner-1",
          role: "delegated",
          userId: "delegated-1",
        },
      ],
      name: "Home Team",
    });

    vi.mocked(userRepository.findById).mockResolvedValue(delegatedUser);
    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new AddDelegatedUserToFamily(
      userRepository,
      familyRepository,
    );
    const result = await useCase.execute({
      delegatedUserId: "delegated-1",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "MEMBER_ALREADY_EXISTS",
        message: "This user is already a member of the family",
      },
      success: false,
    });
  });
});
