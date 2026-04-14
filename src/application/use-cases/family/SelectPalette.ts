import {
  ColorPaletteAlreadyTakenError,
  ValidationError,
} from "@/domain/errors/DomainError";
import type { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export interface SelectPaletteInput {
  colorPalette: string;
  familyId: string;
  userId: string;
}

export type SelectPaletteResult =
  | {
      data: {
        family: Family;
      };
      success: true;
    }
  | {
      error: {
        code:
          | "COLOR_PALETTE_ALREADY_TAKEN"
          | "FAMILY_NOT_FOUND"
          | "FORBIDDEN"
          | "INVALID_PALETTE";
        message: string;
      };
      success: false;
    };

export class SelectPalette {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  async execute(input: SelectPaletteInput): Promise<SelectPaletteResult> {
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
          code: "FORBIDDEN",
          message: "You are not a member of this family",
        },
        success: false,
      };
    }

    try {
      const colorPalette = ColorPalette.create(input.colorPalette);
      family.updateMemberPalette(input.userId, colorPalette);
      await this.familyRepository.save(family);

      return {
        data: { family },
        success: true,
      };
    } catch (error) {
      if (error instanceof ColorPaletteAlreadyTakenError) {
        return {
          error: {
            code: "COLOR_PALETTE_ALREADY_TAKEN",
            message: error.message,
          },
          success: false,
        };
      }

      if (error instanceof ValidationError) {
        return {
          error: {
            code: "INVALID_PALETTE",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
