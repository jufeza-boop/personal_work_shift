import { describe, expect, it, vi } from "vitest";
import { CreateInvitation } from "@/application/use-cases/family/CreateInvitation";
import { Family } from "@/domain/entities/Family";
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

function makeFamily() {
  return new Family({
    createdBy: "owner-1",
    id: "family-1",
    name: "Mi Familia",
  });
}

describe("CreateInvitation", () => {
  it("creates and saves an active invitation for the owner", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    vi.mocked(familyRepo.findById).mockResolvedValue(makeFamily());

    const useCase = new CreateInvitation(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "family-1",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitation.familyId).toBe("family-1");
      expect(result.data.invitation.status).toBe("active");
      expect(result.data.invitation.token).toBeTruthy();
      expect(result.data.invitation.createdBy).toBe("owner-1");
      expect(invitationRepo.save).toHaveBeenCalledWith(result.data.invitation);
    }
  });

  it("returns FAMILY_NOT_FOUND when family does not exist", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    vi.mocked(familyRepo.findById).mockResolvedValue(null);

    const useCase = new CreateInvitation(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "non-existent",
      requestedBy: "owner-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("FAMILY_NOT_FOUND");
    }
  });

  it("returns FORBIDDEN when requester is not the owner", async () => {
    const familyRepo = makeFamilyRepo();
    const invitationRepo = makeInvitationRepo();
    vi.mocked(familyRepo.findById).mockResolvedValue(makeFamily());

    const useCase = new CreateInvitation(familyRepo, invitationRepo);
    const result = await useCase.execute({
      familyId: "family-1",
      requestedBy: "not-the-owner",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("FORBIDDEN");
    }
    expect(invitationRepo.save).not.toHaveBeenCalled();
  });
});
