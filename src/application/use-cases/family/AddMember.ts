import {
  ColorPaletteAlreadyTakenError,
  ValidationError,
} from "@/domain/errors/DomainError";
import { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export interface AddMemberInput {
  colorPalette: string;
  email: string;
  familyId: string;
  requesterUserId: string;
}

export type AddMemberResult =
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
          | "MEMBER_ALREADY_EXISTS"
          | "USER_NOT_FOUND";
        message: string;
      };
      success: false;
    };

export class AddMember {
  constructor(
    private readonly familyRepository: IFamilyRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: AddMemberInput): Promise<AddMemberResult> {
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
          message: "Only the family owner can add members",
        },
        success: false,
      };
    }

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "The invited user must already have an account",
        },
        success: false,
      };
    }

    try {
      family.addMember({
        colorPalette: ColorPalette.create(input.colorPalette),
        role: "member",
        userId: user.id,
      });

      await this.familyRepository.save(family);

      return {
        data: {
          family,
        },
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
            code: "MEMBER_ALREADY_EXISTS",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
