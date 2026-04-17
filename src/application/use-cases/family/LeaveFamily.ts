import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

export interface LeaveFamilyInput {
  familyId: string;
  userId: string;
}

export type LeaveFamilyResult =
  | { success: true }
  | {
      success: false;
      error: {
        code: "FAMILY_NOT_FOUND" | "OWNER_CANNOT_LEAVE" | "NOT_A_MEMBER";
        message: string;
      };
    };

export class LeaveFamily {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(input: LeaveFamilyInput): Promise<LeaveFamilyResult> {
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

    if (family.createdBy === input.userId) {
      return {
        error: {
          code: "OWNER_CANNOT_LEAVE",
          message:
            "The family owner cannot leave. Delete the family instead.",
        },
        success: false,
      };
    }

    if (!family.hasMember(input.userId)) {
      return {
        error: {
          code: "NOT_A_MEMBER",
          message: "You are not a member of this family",
        },
        success: false,
      };
    }

    family.removeMember(input.userId);
    await this.familyRepository.save(family);

    return { success: true };
  }
}
