import { describe, expect, it, vi } from "vitest";
import { AddMember } from "@/application/use-cases/family/AddMember";
import { Family } from "@/domain/entities/Family";
import { User } from "@/domain/entities/User";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createFamilyRepository(): IFamilyRepository {
  return {
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

describe("AddMember", () => {
  it("adds a registered user with a unique palette to an owned family", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      new User({
        displayName: "Bob Example",
        email: "bob@example.com",
        id: "member-1",
      }),
    );

    const useCase = new AddMember(familyRepository, userRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      email: " bob@example.com ",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(result).toEqual({
      data: {
        family,
      },
      success: true,
    });
    expect(family.members).toContainEqual({
      colorPalette: ColorPalette.create("sky"),
      delegatedByUserId: null,
      role: "member",
      userId: "member-1",
    });
    expect(familyRepository.save).toHaveBeenCalledWith(family);
  });

  it("rejects invitations from non-owners", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          colorPalette: ColorPalette.create("rose"),
          role: "member",
          userId: "member-2",
        },
      ],
      name: "Home Team",
    });

    vi.mocked(familyRepository.findById).mockResolvedValue(family);

    const useCase = new AddMember(familyRepository, userRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      email: "bob@example.com",
      familyId: "family-1",
      requesterUserId: "member-2",
    });

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "FORBIDDEN",
        message: "Only the family owner can add members",
      },
      success: false,
    });
  });

  it("rejects a palette that is already taken", async () => {
    const familyRepository = createFamilyRepository();
    const userRepository = createUserRepository();
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
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      new User({
        displayName: "Bob Example",
        email: "bob@example.com",
        id: "member-2",
      }),
    );

    const useCase = new AddMember(familyRepository, userRepository);
    const result = await useCase.execute({
      colorPalette: "sky",
      email: "bob@example.com",
      familyId: "family-1",
      requesterUserId: "owner-1",
    });

    expect(familyRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "COLOR_PALETTE_ALREADY_TAKEN",
        message: "Color palette sky is already assigned in this family",
      },
      success: false,
    });
  });
});
