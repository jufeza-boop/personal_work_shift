import { describe, expect, it, vi } from "vitest";
import { CancelInvitation } from "@/application/use-cases/family/CancelInvitation";
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

describe("CancelInvitation", () => {
  it("cancels an active invitation", async () => {
    const invitationRepo = makeInvitationRepo();
    const familyRepo = makeFamilyRepo();
    const invitation = makeActiveInvitation();

    vi.mocked(invitationRepo.findById).mockResolvedValue(invitation);
    vi.mocked(familyRepo.findById).mockResolvedValue(makeFamily());

    const useCase = new CancelInvitation(invitationRepo, familyRepo);
    const result = await useCase.execute({
      invitationId: "inv-1",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(true);
    expect(invitation.status).toBe("cancelled");
    expect(invitationRepo.save).toHaveBeenCalledWith(invitation);
  });

  it("returns INVITATION_NOT_FOUND for unknown id", async () => {
    const invitationRepo = makeInvitationRepo();
    const familyRepo = makeFamilyRepo();
    vi.mocked(invitationRepo.findById).mockResolvedValue(null);

    const useCase = new CancelInvitation(invitationRepo, familyRepo);
    const result = await useCase.execute({
      invitationId: "missing",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVITATION_NOT_FOUND");
    }
  });

  it("returns FORBIDDEN when requester is not the owner", async () => {
    const invitationRepo = makeInvitationRepo();
    const familyRepo = makeFamilyRepo();
    vi.mocked(invitationRepo.findById).mockResolvedValue(
      makeActiveInvitation(),
    );
    vi.mocked(familyRepo.findById).mockResolvedValue(makeFamily());

    const useCase = new CancelInvitation(invitationRepo, familyRepo);
    const result = await useCase.execute({
      invitationId: "inv-1",
      requestedBy: "not-owner",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("FORBIDDEN");
    }
    expect(invitationRepo.save).not.toHaveBeenCalled();
  });

  it("returns INVITATION_NOT_ACTIVE when invitation is not active", async () => {
    const invitationRepo = makeInvitationRepo();
    const familyRepo = makeFamilyRepo();
    const usedInvitation = makeActiveInvitation();
    usedInvitation.status = "used";

    vi.mocked(invitationRepo.findById).mockResolvedValue(usedInvitation);
    vi.mocked(familyRepo.findById).mockResolvedValue(makeFamily());

    const useCase = new CancelInvitation(invitationRepo, familyRepo);
    const result = await useCase.execute({
      invitationId: "inv-1",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVITATION_NOT_ACTIVE");
    }
  });
});
