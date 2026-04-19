import { describe, expect, it, vi } from "vitest";
import { LeaveFamily } from "@/application/use-cases/family/LeaveFamily";
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

describe("LeaveFamily", () => {
  it("removes the requesting user from the family", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ userId: "member-1", role: "member" }],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new LeaveFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      userId: "member-1",
    });

    expect(result).toEqual({ success: true });
    expect(familyRepository.save).toHaveBeenCalledOnce();

    const savedFamily = vi.mocked(familyRepository.save).mock
      .calls[0]?.[0] as Family;
    expect(savedFamily.hasMember("member-1")).toBe(false);
  });

  it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
    const familyRepository = createFamilyRepository();
    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new LeaveFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "nonexistent",
      userId: "member-1",
    });

    expect(result).toEqual({
      error: {
        code: "FAMILY_NOT_FOUND",
        message: "The specified family does not exist",
      },
      success: false,
    });
  });

  it("returns OWNER_CANNOT_LEAVE when the owner tries to leave", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new LeaveFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      userId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "OWNER_CANNOT_LEAVE",
        message: "The family owner cannot leave. Delete the family instead.",
      },
      success: false,
    });
  });

  it("returns NOT_A_MEMBER when the user is not in the family", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new LeaveFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      userId: "stranger",
    });

    expect(result).toEqual({
      error: {
        code: "NOT_A_MEMBER",
        message: "You are not a member of this family",
      },
      success: false,
    });
  });
});
