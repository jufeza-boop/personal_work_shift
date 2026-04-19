import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

export interface RenameDelegatedUserInput {
  parentId: string;
  delegatedUserId: string;
  displayName: string;
}

export type RenameDelegatedUserResult =
  | { success: true }
  | {
      success: false;
      error: {
        code:
          | "USER_NOT_FOUND"
          | "FORBIDDEN"
          | "NOT_DELEGATED"
          | "INVALID_DISPLAY_NAME";
        message: string;
      };
    };

export class RenameDelegatedUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    input: RenameDelegatedUserInput,
  ): Promise<RenameDelegatedUserResult> {
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

    if (delegatedUser.delegatedByUserId !== input.parentId) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "You are not the parent of this delegated user",
        },
        success: false,
      };
    }

    const updatedUser = new User({
      avatarUrl: delegatedUser.avatarUrl,
      delegatedByUserId: delegatedUser.delegatedByUserId,
      displayName,
      email: delegatedUser.email,
      id: delegatedUser.id,
    });

    await this.userRepository.save(updatedUser);

    return { success: true };
  }
}
