import { describe, expect, it, vi } from "vitest";
import { RemoveFamilyMember } from "@/application/use-cases/family/RemoveFamilyMember";
import { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

describe("RemoveFamilyMember", () => {
  it("removes a member from the family when requested by the owner", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ userId: "member-1", role: "member" }],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RemoveFamilyMember(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      memberUserId: "member-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({ success: true });
    expect(familyRepository.save).toHaveBeenCalledOnce();

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    expect(savedFamily.hasMember("member-1")).toBe(false);
  });

  it("returns FAMILY_NOT_FOUND when family does not exist", async () => {
    const familyRepository = createFamilyRepository();
    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new RemoveFamilyMember(familyRepository);
    const result = await useCase.execute({
      familyId: "nonexistent",
      memberUserId: "member-1",
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

  it("returns FORBIDDEN when the requester is not the owner", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ userId: "member-1", role: "member" }],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RemoveFamilyMember(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      memberUserId: "member-1",
      requesterUserId: "member-1", // not the owner
    });

    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Only the family owner can remove members",
      },
      success: false,
    });
  });

  it("returns CANNOT_REMOVE_OWNER when trying to remove the owner", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RemoveFamilyMember(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      memberUserId: "owner-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "CANNOT_REMOVE_OWNER",
        message: "Cannot remove the owner from the family",
      },
      success: false,
    });
  });

  it("returns MEMBER_NOT_FOUND when the target user is not a member", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RemoveFamilyMember(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      memberUserId: "stranger",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "MEMBER_NOT_FOUND",
        message: "The specified user is not a member of this family",
      },
      success: false,
    });
  });
});
