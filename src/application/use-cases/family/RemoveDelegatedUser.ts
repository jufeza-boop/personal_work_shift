import { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

export interface RemoveDelegatedUserInput {
  parentId: string;
  delegatedUserId: string;
}

export type RemoveDelegatedUserResult =
  | { success: true }
  | {
      success: false;
      error: {
        code: "USER_NOT_FOUND" | "FORBIDDEN";
        message: string;
      };
    };

export class RemoveDelegatedUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(
    input: RemoveDelegatedUserInput,
  ): Promise<RemoveDelegatedUserResult> {
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

    if (delegatedUser.delegatedByUserId !== input.parentId) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "You are not the parent of this delegated user",
        },
        success: false,
      };
    }

    // Remove the delegated user from all families they belong to.
    const families = await this.familyRepository.findByUserId(
      input.delegatedUserId,
    );

    for (const family of families) {
      const updatedFamily = new Family({
        createdBy: family.createdBy,
        id: family.id,
        members: family.members
          .filter((m) => m.userId !== input.delegatedUserId)
          .map((m) => ({
            colorPalette: m.colorPalette,
            delegatedByUserId: m.delegatedByUserId,
            role: m.role,
            userId: m.userId,
          })),
        name: family.name,
      });

      await this.familyRepository.save(updatedFamily);
    }

    await this.userRepository.delete(input.delegatedUserId);

    return { success: true };
  }
}
