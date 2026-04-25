import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";

export interface CancelInvitationInput {
  invitationId: string;
  requestedBy: string;
}

export type CancelInvitationResult =
  | { success: true }
  | {
      error: {
        code: "FORBIDDEN" | "INVITATION_NOT_FOUND" | "INVITATION_NOT_ACTIVE";
        message: string;
      };
      success: false;
    };

export class CancelInvitation {
  constructor(
    private readonly invitationRepository: IInvitationRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(input: CancelInvitationInput): Promise<CancelInvitationResult> {
    const invitation = await this.invitationRepository.findById(
      input.invitationId,
    );

    if (!invitation) {
      return {
        error: {
          code: "INVITATION_NOT_FOUND",
          message: "Invitation not found",
        },
        success: false,
      };
    }

    const family = await this.familyRepository.findById(invitation.familyId);

    if (!family || family.createdBy !== input.requestedBy) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Only the family owner can cancel invitations",
        },
        success: false,
      };
    }

    if (invitation.status !== "active") {
      return {
        error: {
          code: "INVITATION_NOT_ACTIVE",
          message: "Only active invitations can be cancelled",
        },
        success: false,
      };
    }

    invitation.cancel();
    await this.invitationRepository.save(invitation);

    return { success: true };
  }
}
