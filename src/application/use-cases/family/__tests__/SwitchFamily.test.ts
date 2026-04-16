import { describe, expect, it, vi } from "vitest";
import { SwitchFamily } from "@/application/use-cases/family/SwitchFamily";
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

describe("SwitchFamily", () => {
  it("allows a member to activate one of their families", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          role: "member",
          userId: "member-1",
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SwitchFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      userId: "member-1",
    });

    expect(result).toEqual({
      data: {
        family,
      },
      success: true,
    });
  });

  it("rejects switching to a family the user does not belong to", async () => {
    const familyRepository = createFamilyRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new SwitchFamily(familyRepository);
    const result = await useCase.execute({
      familyId: "family-1",
      userId: "outsider-1",
    });

    expect(result).toEqual({
      error: {
        code: "ACCESS_DENIED",
        message: "You can only switch to a family you belong to",
      },
      success: false,
    });
  });
});
