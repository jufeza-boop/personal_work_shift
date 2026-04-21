import { describe, expect, it, vi } from "vitest";
import { RenameFamily } from "@/application/use-cases/family/RenameFamily";
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

describe("RenameFamily", () => {
  it("renames a family when requested by the owner", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Old Name",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RenameFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      name: "  Work Team  ",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      data: {
        family,
      },
      success: true,
    });
    expect(family.name).toBe("Work Team");
    expect(familyRepository.save).toHaveBeenCalledWith(family);
  });

  it("rejects rename attempts from non-owners", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
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

    const useCase = new RenameFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      name: "Work Team",
      requesterUserId: "member-1",
    });

    expect(familyRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Only the family owner can rename the family",
      },
      success: false,
    });
  });

  it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
    const familyRepository = createFamilyRepository();

    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new RenameFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "nonexistent",
      name: "New Name",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      error: {
        code: "FAMILY_NOT_FOUND",
        message: "The requested family does not exist",
      },
      success: false,
    });
  });

  it("returns INVALID_NAME when the name is empty", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new RenameFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      name: "   ",
      requesterUserId: "owner-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_NAME");
    }
    expect(familyRepository.save).not.toHaveBeenCalled();
  });
});
