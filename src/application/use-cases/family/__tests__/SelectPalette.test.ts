import { describe, expect, it, vi } from "vitest";
import { SelectPalette } from "@/application/use-cases/family/SelectPalette";
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

describe("SelectPalette", () => {
  it("assigns a free palette to a family member", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          userId: "member-1",
          role: "member",
          colorPalette: null,
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      familyId: "family-1",
      userId: "member-1",
    });

    expect(result).toEqual({ data: { family }, success: true });
    const member = family.members.find((m) => m.userId === "member-1");
    expect(member?.colorPalette).toEqual(ColorPalette.create("sky"));
    expect(familyRepository.save).toHaveBeenCalledWith(family);
  });

  it("allows changing an existing palette to a free one", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          userId: "member-1",
          role: "member",
          colorPalette: ColorPalette.create("rose"),
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      familyId: "family-1",
      userId: "member-1",
    });

    expect(result.success).toBe(true);
    const member = family.members.find((m) => m.userId === "member-1");
    expect(member?.colorPalette?.name).toBe("sky");
  });

  it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
    const familyRepository = createFamilyRepository();
    vi.mocked(familyRepository.findById).mockResolvedValue(null);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      familyId: "missing",
      userId: "user-1",
    });

    expect(result).toEqual({
      error: { code: "FAMILY_NOT_FOUND", message: expect.any(String) },
      success: false,
    });
  });

  it("returns FORBIDDEN when the user is not a member of the family", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      familyId: "family-1",
      userId: "stranger",
    });

    expect(result).toEqual({
      error: { code: "FORBIDDEN", message: expect.any(String) },
      success: false,
    });
    expect(familyRepository.save).not.toHaveBeenCalled();
  });

  it("returns COLOR_PALETTE_ALREADY_TAKEN when another member has the palette", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          userId: "member-1",
          role: "member",
          colorPalette: ColorPalette.create("rose"),
        },
        {
          userId: "member-2",
          role: "member",
          colorPalette: ColorPalette.create("sky"),
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      familyId: "family-1",
      userId: "member-1",
    });

    expect(result).toEqual({
      error: {
        code: "COLOR_PALETTE_ALREADY_TAKEN",
        message: expect.any(String),
      },
      success: false,
    });
    expect(familyRepository.save).not.toHaveBeenCalled();
  });

  it("returns INVALID_PALETTE when an unknown palette name is supplied", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SelectPalette(familyRepository);
    const result = await useCase.execute({
      colorPalette: "neon",
      familyId: "family-1",
      userId: "owner-1",
    });

    expect(result).toEqual({
      error: { code: "INVALID_PALETTE", message: expect.any(String) },
      success: false,
    });
  });
});
