import { randomUUID } from "node:crypto";
import { User } from "@/domain/entities/User";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export interface CreateDelegatedUserInput {
  parentId: string;
  familyId: string;
  displayName: string;
  colorPalette?: string;
}

export type CreateDelegatedUserResult =
  | {
      success: true;
      data: { delegatedUser: User };
    }
  | {
      success: false;
      error: {
        code:
          | "FAMILY_NOT_FOUND"
          | "NOT_A_FAMILY_MEMBER"
          | "INVALID_DISPLAY_NAME";
        message: string;
      };
    };

export class CreateDelegatedUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(
    input: CreateDelegatedUserInput,
  ): Promise<CreateDelegatedUserResult> {
    const displayName = input.displayName.trim();

    if (displayName.length === 0) {
      return {
        error: {
          code: "INVALID_DISPLAY_NAME",
          message: "Display name cannot be empty",
        },
        success: false,
      };
    }

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

    if (!family.hasMember(input.parentId)) {
      return {
        error: {
          code: "NOT_A_FAMILY_MEMBER",
          message: "The parent must be a member of the family",
        },
        success: false,
      };
    }

    try {
      const delegatedUserId = randomUUID();
      // Synthetic email for the delegated user — not a real auth account.
      const SYNTHETIC_EMAIL_DOMAIN = "pws.local";
      const syntheticEmail = `delegated-${delegatedUserId}@${SYNTHETIC_EMAIL_DOMAIN}`;

      const delegatedUser = new User({
        delegatedByUserId: input.parentId,
        displayName,
        email: syntheticEmail,
        id: delegatedUserId,
      });

      await this.userRepository.save(delegatedUser);

      const memberColorPalette = input.colorPalette
        ? ColorPalette.create(input.colorPalette)
        : undefined;

      family.addMember({
        colorPalette: memberColorPalette,
        delegatedByUserId: input.parentId,
        role: "delegated",
        userId: delegatedUserId,
      });

      await this.familyRepository.save(family);

      return {
        data: { delegatedUser },
        success: true,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          error: {
            code: "INVALID_DISPLAY_NAME",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
