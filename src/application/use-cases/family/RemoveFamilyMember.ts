import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

export interface RemoveFamilyMemberInput {
  familyId: string;
  memberUserId: string;
  requesterUserId: string;
}

export type RemoveFamilyMemberResult =
  | { success: true }
  | {
      success: false;
      error: {
        code:
          | "FAMILY_NOT_FOUND"
          | "FORBIDDEN"
          | "CANNOT_REMOVE_OWNER"
          | "MEMBER_NOT_FOUND";
        message: string;
      };
    };

export class RemoveFamilyMember {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(
    input: RemoveFamilyMemberInput,
  ): Promise<RemoveFamilyMemberResult> {
    const family = await this.familyRepository.findById(input.familyId);

    if (!family) {
      return {
        error: {
          code: "FAMILY_NOT_FOUND",
          message: "The specified family does not exist",
        },
        success: false,
      };
    }

    if (family.createdBy !== input.requesterUserId) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Only the family owner can remove members",
        },
        success: false,
      };
    }

    if (input.memberUserId === family.createdBy) {
      return {
        error: {
          code: "CANNOT_REMOVE_OWNER",
          message: "Cannot remove the owner from the family",
        },
        success: false,
      };
    }

    if (!family.hasMember(input.memberUserId)) {
      return {
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "The specified user is not a member of this family",
        },
        success: false,
      };
    }

    family.removeMember(input.memberUserId);
    await this.familyRepository.save(family);

    return { success: true };
  }
}
