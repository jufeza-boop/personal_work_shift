import { describe, expect, it, vi } from "vitest";
import { CreateFamily } from "@/application/use-cases/family/CreateFamily";
import { User } from "@/domain/entities/User";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

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
    findByEmail: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
  };
}

describe("CreateFamily", () => {
  it("creates a family and saves the owner membership", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(
      new User({
        displayName: "Alice Example",
        email: "alice@example.com",
        id: "owner-1",
      }),
    );

    const useCase = new CreateFamily(familyRepository, userRepository);
    const result = await useCase.execute({
      createdBy: "owner-1",
      name: "  Home Team  ",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.family.name).toBe("Home Team");
    expect(result.success && result.data.family.createdBy).toBe("owner-1");
    expect(result.success && result.data.family.members).toEqual([
      {
        colorPalette: null,
        delegatedByUserId: null,
        role: "owner",
        userId: "owner-1",
      },
    ]);
    expect(familyRepository.save).toHaveBeenCalledTimes(1);
  });

  it("assigns the owner palette when ownerColorPalette is provided", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(
      new User({
        displayName: "Alice Example",
        email: "alice@example.com",
        id: "owner-1",
      }),
    );

    const useCase = new CreateFamily(familyRepository, userRepository);
    const result = await useCase.execute({
      createdBy: "owner-1",
      name: "Home Team",
      ownerColorPalette: "sky",
    });

    expect(result.success).toBe(true);
    const owner =
      result.success &&
      result.data.family.members.find((m) => m.userId === "owner-1");
    expect(owner && owner.colorPalette?.name).toBe("sky");
    expect(
      owner && owner.colorPalette?.equals(ColorPalette.create("sky")),
    ).toBe(true);
  });

  it("rejects a missing owner", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new CreateFamily(familyRepository, userRepository);
    const result = await useCase.execute({
      createdBy: "owner-1",
      name: "Home Team",
    });

    expect(familyRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "USER_NOT_FOUND",
        message: "The owner must exist before creating a family",
      },
      success: false,
    });
  });

  it("returns INVALID_NAME when the name is empty", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(
      new User({
        displayName: "Alice Example",
        email: "alice@example.com",
        id: "owner-1",
      }),
    );

    const useCase = new CreateFamily(familyRepository, userRepository);
    const result = await useCase.execute({
      createdBy: "owner-1",
      name: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_NAME");
    }
    expect(familyRepository.save).not.toHaveBeenCalled();
  });
});
