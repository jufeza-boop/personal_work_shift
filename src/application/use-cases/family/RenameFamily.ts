import { Family } from "@/domain/entities/Family";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

export interface RenameFamilyInput {
  familyId: string;
  name: string;
  requesterUserId: string;
}

export type RenameFamilyResult =
  | {
      data: {
        family: Family;
      };
      success: true;
    }
  | {
      error: {
        code: "FAMILY_NOT_FOUND" | "FORBIDDEN" | "INVALID_NAME";
        message: string;
      };
      success: false;
    };

export class RenameFamily {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(input: RenameFamilyInput): Promise<RenameFamilyResult> {
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
          message: "Only the family owner can rename the family",
        },
        success: false,
      };
    }

    try {
      family.rename(input.name);
      await this.familyRepository.save(family);

      return {
        data: {
          family,
        },
        success: true,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          error: {
            code: "INVALID_NAME",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
