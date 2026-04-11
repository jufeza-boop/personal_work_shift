import { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

export interface SwitchFamilyInput {
  familyId: string;
  userId: string;
}

export type SwitchFamilyResult =
  | {
      data: {
        family: Family;
      };
      success: true;
    }
  | {
      error: {
        code: "ACCESS_DENIED" | "FAMILY_NOT_FOUND";
        message: string;
      };
      success: false;
    };

export class SwitchFamily {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(input: SwitchFamilyInput): Promise<SwitchFamilyResult> {
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

    if (!family.hasMember(input.userId)) {
      return {
        error: {
          code: "ACCESS_DENIED",
          message: "You can only switch to a family you belong to",
        },
        success: false,
      };
    }

    return {
      data: {
        family,
      },
      success: true,
    };
  }
}
