import { describe, expect, it, vi } from "vitest";
import { DeleteFamily } from "@/application/use-cases/family/DeleteFamily";
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

describe("DeleteFamily", () => {
  it("deletes a family when requested by the owner", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Test Family",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new DeleteFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({ success: true });
    expect(familyRepository.delete).toHaveBeenCalledWith("family-1");
  });

  it("rejects deletion by a non-owner member", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        { colorPalette: null, role: "owner", userId: "owner-1" },
        { colorPalette: null, role: "member", userId: "member-1" },
      ],
      name: "Test Family",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new DeleteFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      requesterUserId: "member-1",
    });

    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Only the family owner can delete the family",
      },
      success: false,
    });
    expect(familyRepository.delete).not.toHaveBeenCalled();
  });

  it("returns FAMILY_NOT_FOUND when family does not exist", async () => {
    const familyRepository = createFamilyRepository();

    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new DeleteFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "nonexistent-family",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "FAMILY_NOT_FOUND",
        message: "The requested family does not exist",
      },
      success: false,
    });
    expect(familyRepository.delete).not.toHaveBeenCalled();
  });
});
