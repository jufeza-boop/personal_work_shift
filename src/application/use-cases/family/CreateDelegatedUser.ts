import { randomUUID } from "node:crypto";
import { User } from "@/domain/entities/User";
import { ValidationError } from "@/domain/errors/DomainError";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

export interface CreateDelegatedUserInput {
  parentId: string;
  displayName: string;
}

export type CreateDelegatedUserResult =
  | {
      success: true;
      data: { delegatedUser: User };
    }
  | {
      success: false;
      error: {
        code: "INVALID_DISPLAY_NAME";
        message: string;
      };
    };

export class CreateDelegatedUser {
  constructor(private readonly userRepository: IUserRepository) {}

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

    try {
      const delegatedUserId = randomUUID();
      const SYNTHETIC_EMAIL_DOMAIN = "pws.local";
      const syntheticEmail = `delegated-${delegatedUserId}@${SYNTHETIC_EMAIL_DOMAIN}`;

      const delegatedUser = new User({
        delegatedByUserId: input.parentId,
        displayName,
        email: syntheticEmail,
        id: delegatedUserId,
      });

      await this.userRepository.save(delegatedUser);

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
