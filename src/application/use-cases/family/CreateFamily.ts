import { randomUUID } from "node:crypto";
import { Family } from "@/domain/entities/Family";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import {
  ColorPalette,
  type ColorPaletteName,
} from "@/domain/value-objects/ColorPalette";

export interface CreateFamilyInput {
  createdBy: string;
  name: string;
  ownerColorPalette?: ColorPaletteName;
}

export type CreateFamilyResult =
  | {
      data: {
        family: Family;
      };
      success: true;
    }
  | {
      error: {
        code: "INVALID_NAME" | "USER_NOT_FOUND";
        message: string;
      };
      success: false;
    };

export class CreateFamily {
  constructor(
    private readonly familyRepository: IFamilyRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateFamilyInput): Promise<CreateFamilyResult> {
    const owner = await this.userRepository.findById(input.createdBy);

    if (!owner) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "The owner must exist before creating a family",
        },
        success: false,
      };
    }

    try {
      const family = new Family({
        createdBy: input.createdBy,
        id: randomUUID(),
        name: input.name,
      });

      if (input.ownerColorPalette) {
        family.updateMemberPalette(
          input.createdBy,
          ColorPalette.create(input.ownerColorPalette),
        );
      }

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
