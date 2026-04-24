import type {
  AuthResult,
  DeleteAccountAuthErrorCode,
  IAuthService,
} from "@/application/services/IAuthService";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

export type DeleteAccountResult = AuthResult<
  void,
  DeleteAccountAuthErrorCode | "USER_NOT_FOUND"
>;

export interface DeleteAccountInput {
  userId: string;
}

export class DeleteAccount {
  constructor(
    private readonly authService: IAuthService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: DeleteAccountInput): Promise<DeleteAccountResult> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
        success: false,
      };
    }

    // Delete the auth provider account first so auth state is invalidated
    const authResult = await this.authService.deleteAccount(input.userId);

    if (!authResult.success) {
      return authResult;
    }

    // Remove the user profile row
    await this.userRepository.delete(input.userId);

    return {
      data: undefined,
      success: true,
    };
  }
}
