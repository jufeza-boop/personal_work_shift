import type { AuthResult } from "@/application/services/IAuthService";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User } from "@/domain/entities/User";
import { ValidationError } from "@/domain/errors/DomainError";

export type UpdateProfileErrorCode = "USER_NOT_FOUND" | "INVALID_DISPLAY_NAME";

export type UpdateProfileResult = AuthResult<void, UpdateProfileErrorCode>;

export interface UpdateProfileInput {
  userId: string;
  displayName: string;
}

export class UpdateProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const existing = await this.userRepository.findById(input.userId);

    if (!existing) {
      return {
        error: { code: "USER_NOT_FOUND", message: "User not found" },
        success: false,
      };
    }

    let updated: User;

    try {
      updated = new User({
        avatarUrl: existing.avatarUrl,
        delegatedByUserId: existing.delegatedByUserId,
        displayName: input.displayName,
        email: existing.email,
        id: existing.id,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        return {
          error: {
            code: "INVALID_DISPLAY_NAME",
            message: err.message,
          },
          success: false,
        };
      }

      throw err;
    }

    await this.userRepository.save(updated);

    return { data: undefined, success: true };
  }
}
