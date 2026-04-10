import type {
  AuthResult,
  IAuthService,
  LogoutAuthErrorCode,
} from "@/application/services/IAuthService";

export type LogoutUserResult = AuthResult<void, LogoutAuthErrorCode>;

export class LogoutUser {
  constructor(private readonly authService: IAuthService) {}

  async execute(): Promise<LogoutUserResult> {
    return this.authService.logout();
  }
}
