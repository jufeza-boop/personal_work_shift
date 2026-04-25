import { describe, expect, it, vi } from "vitest";
import { ListFamilyInvitations } from "@/application/use-cases/family/ListFamilyInvitations";
import { Family } from "@/domain/entities/Family";
import {
  Invitation,
  INVITATION_EXPIRY_DAYS,
} from "@/domain/entities/Invitation";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";

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

function makeInvitation(id: string): Invitation {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  return new Invitation({
    createdAt: now,
    createdBy: "owner-1",
    expiresAt,
    familyId: "family-1",
    familyName: "Mi Familia",
    id,
    status: "active",
    token: `tok-${id}`,
  });
}

describe("ListFamilyInvitations", () => {
  it("returns all invitations for the family when owner requests", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    const invitations = [makeInvitation("inv-1"), makeInvitation("inv-2")];

    vi.mocked(familyRepo.findById).mockResolvedValue(
      new Family({ createdBy: "owner-1", id: "family-1", name: "Mi Familia" }),
    );
    vi.mocked(invitationRepo.findByFamilyId).mockResolvedValue(invitations);

    const useCase = new ListFamilyInvitations(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "family-1",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitations).toHaveLength(2);
    }
  });

  it("returns FAMILY_NOT_FOUND when family doesn't exist", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    vi.mocked(familyRepo.findById).mockResolvedValue(null);

    const useCase = new ListFamilyInvitations(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "missing",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("FAMILY_NOT_FOUND");
    }
  });

  it("returns FORBIDDEN when non-owner tries to list invitations", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    vi.mocked(familyRepo.findById).mockResolvedValue(
      new Family({ createdBy: "owner-1", id: "family-1", name: "Mi Familia" }),
    );

    const useCase = new ListFamilyInvitations(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "family-1",
      requestedBy: "non-owner",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("FORBIDDEN");
    }
    expect(invitationRepo.findByFamilyId).not.toHaveBeenCalled();
  });
});
