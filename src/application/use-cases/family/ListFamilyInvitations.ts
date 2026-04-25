import type { Invitation } from "@/domain/entities/Invitation";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";

export interface ListFamilyInvitationsInput {
  familyId: string;
  requestedBy: string;
}

export type ListFamilyInvitationsResult =
  | {
      data: {
        invitations: Invitation[];
      };
      success: true;
    }
  | {
      error: {
        code: "FAMILY_NOT_FOUND" | "FORBIDDEN";
        message: string;
      };
      success: false;
    };

export class ListFamilyInvitations {
  constructor(
    private readonly familyRepository: IFamilyRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async execute(
    input: ListFamilyInvitationsInput,
  ): Promise<ListFamilyInvitationsResult> {
    const family = await this.familyRepository.findById(input.familyId);

    if (!family) {
      return {
        error: {
          code: "FAMILY_NOT_FOUND",
          message: "The requested family does not exist",
        },
        success: false,
      };
    }

    if (family.createdBy !== input.requestedBy) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Only the family owner can view invitations",
        },
        success: false,
      };
    }

    const invitations = await this.invitationRepository.findByFamilyId(
      input.familyId,
    );

    return {
      data: { invitations },
      success: true,
    };
  }
}
