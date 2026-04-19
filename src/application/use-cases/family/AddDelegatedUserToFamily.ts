import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export interface AddDelegatedUserToFamilyInput {
  delegatedUserId: string;
  familyId: string;
  requesterUserId: string;
  colorPalette?: string;
}

export type AddDelegatedUserToFamilyResult =
  | { success: true }
  | {
      success: false;
      error: {
        code:
          | "USER_NOT_FOUND"
          | "FORBIDDEN"
          | "NOT_DELEGATED"
          | "FAMILY_NOT_FOUND"
          | "MEMBER_ALREADY_EXISTS";
        message: string;
      };
    };

export class AddDelegatedUserToFamily {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(
    input: AddDelegatedUserToFamilyInput,
  ): Promise<AddDelegatedUserToFamilyResult> {
    const delegatedUser = await this.userRepository.findById(
      input.delegatedUserId,
    );

    if (!delegatedUser) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "Delegated user not found",
        },
        success: false,
      };
    }

    if (!delegatedUser.isDelegated()) {
      return {
        error: {
          code: "NOT_DELEGATED",
          message: "The specified user is not a delegated user",
        },
        success: false,
      };
    }

    if (delegatedUser.delegatedByUserId !== input.requesterUserId) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "You are not the parent of this delegated user",
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

    if (family.hasMember(input.delegatedUserId)) {
      return {
        error: {
          code: "MEMBER_ALREADY_EXISTS",
          message: "This user is already a member of the family",
        },
        success: false,
      };
    }

    const memberColorPalette = input.colorPalette
      ? ColorPalette.create(input.colorPalette)
      : undefined;

    family.addMember({
      colorPalette: memberColorPalette,
      delegatedByUserId: input.requesterUserId,
      role: "delegated",
      userId: input.delegatedUserId,
    });

    await this.familyRepository.save(family);

    return { success: true };
  }
}
