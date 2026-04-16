import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

export interface DeleteFamilyInput {
  familyId: string;
  requesterUserId: string;
}

export type DeleteFamilyResult =
  | {
      success: true;
    }
  | {
      error: {
        code: "FAMILY_NOT_FOUND" | "FORBIDDEN";
        message: string;
      };
      success: false;
    };

export class DeleteFamily {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(input: DeleteFamilyInput): Promise<DeleteFamilyResult> {
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

    if (family.createdBy !== input.requesterUserId) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Only the family owner can delete the family",
        },
        success: false,
      };
    }

    await this.familyRepository.delete(input.familyId);

    return {
      success: true,
    };
  }
}
