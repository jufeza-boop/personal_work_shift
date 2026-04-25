import { describe, expect, it, vi } from "vitest";
import { AcceptInvitation } from "@/application/use-cases/family/AcceptInvitation";
import { Family } from "@/domain/entities/Family";
import {
  Invitation,
  INVITATION_EXPIRY_DAYS,
} from "@/domain/entities/Invitation";
import { User } from "@/domain/entities/User";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function makeFamilyRepo(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

function makeInvitationRepo(): IInvitationRepository {
  return {
    delete: vi.fn(),
    findByFamilyId: vi.fn(),
    findById: vi.fn(),
    findByToken: vi.fn(),
    save: vi.fn(),
  };
}

function makeUserRepo(): IUserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
  };
}

function makeActiveInvitation(): Invitation {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  return new Invitation({
    createdAt: now,
    createdBy: "owner-1",
    expiresAt,
    familyId: "family-1",
    familyName: "Mi Familia",
    id: "inv-1",
    status: "active",
    token: "tok-abc",
  });
}

function makeFamily() {
  return new Family({
    createdBy: "owner-1",
    id: "family-1",
    name: "Mi Familia",
  });
}

function makeUser(id = "user-2") {
  return new User({ displayName: "Ana", email: "ana@example.com", id });
}

describe("AcceptInvitation", () => {
  it("accepts invitation and adds user to family", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    const invitation = makeActiveInvitation();
    const family = makeFamily();

    vi.mocked(invitationRepo.findByToken).mockResolvedValue(invitation);
    vi.mocked(userRepo.findById).mockResolvedValue(makeUser("user-2"));
    vi.mocked(familyRepo.findById).mockResolvedValue(family);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "tok-abc",
      userId: "user-2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.familyId).toBe("family-1");
      expect(result.data.familyName).toBe("Mi Familia");
    }
    expect(family.hasMember("user-2")).toBe(true);
    expect(invitation.status).toBe("used");
    expect(familyRepo.save).toHaveBeenCalled();
    expect(invitationRepo.save).toHaveBeenCalled();
  });

  it("returns INVITATION_NOT_FOUND for unknown token", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    vi.mocked(invitationRepo.findByToken).mockResolvedValue(null);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "bad-token",
      userId: "user-2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVITATION_NOT_FOUND");
    }
  });

  it("returns INVITATION_NOT_USABLE for expired invitation", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    const expired = new Invitation({
      createdAt: new Date("2025-01-01"),
      createdBy: "owner-1",
      expiresAt: new Date("2025-01-08"),
      familyId: "family-1",
      familyName: "Mi Familia",
      id: "inv-exp",
      status: "active",
      token: "tok-exp",
    });
    vi.mocked(invitationRepo.findByToken).mockResolvedValue(expired);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "tok-exp",
      userId: "user-2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVITATION_NOT_USABLE");
    }
  });

  it("returns ALREADY_MEMBER when user is already in the family", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    const invitation = makeActiveInvitation();
    // Add user-2 to family already
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ role: "member", userId: "user-2" }],
      name: "Mi Familia",
    });

    vi.mocked(invitationRepo.findByToken).mockResolvedValue(invitation);
    vi.mocked(userRepo.findById).mockResolvedValue(makeUser("user-2"));
    vi.mocked(familyRepo.findById).mockResolvedValue(family);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "tok-abc",
      userId: "user-2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("ALREADY_MEMBER");
    }
  });

  it("returns COLOR_PALETTE_ALREADY_TAKEN when palette is taken", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    const invitation = makeActiveInvitation();
    const { ColorPalette } =
      await import("@/domain/value-objects/ColorPalette");
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          colorPalette: ColorPalette.create("rose"),
          role: "member",
          userId: "user-3",
        },
      ],
      name: "Mi Familia",
    });

    vi.mocked(invitationRepo.findByToken).mockResolvedValue(invitation);
    vi.mocked(userRepo.findById).mockResolvedValue(makeUser("user-2"));
    vi.mocked(familyRepo.findById).mockResolvedValue(family);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "tok-abc",
      userId: "user-2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("COLOR_PALETTE_ALREADY_TAKEN");
    }
  });

  it("returns USER_NOT_FOUND when accepting user doesn't exist", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const userRepo = makeUserRepo();
    vi.mocked(invitationRepo.findByToken).mockResolvedValue(
      makeActiveInvitation(),
    );
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    const useCase = new AcceptInvitation(familyRepo, invitationRepo, userRepo);
    const result = await useCase.execute({
      colorPalette: "rose",
      token: "tok-abc",
      userId: "ghost",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("USER_NOT_FOUND");
    }
  });
});
