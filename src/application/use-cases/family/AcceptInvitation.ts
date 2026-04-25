import {
  ColorPaletteAlreadyTakenError,
  ValidationError,
} from "@/domain/errors/DomainError";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export interface AcceptInvitationInput {
  colorPalette: string;
  token: string;
  userId: string;
}

export type AcceptInvitationResult =
  | {
      data: {
        familyId: string;
        familyName: string;
      };
      success: true;
    }
  | {
      error: {
        code:
          | "ALREADY_MEMBER"
          | "COLOR_PALETTE_ALREADY_TAKEN"
          | "FAMILY_NOT_FOUND"
          | "INVITATION_NOT_FOUND"
          | "INVITATION_NOT_USABLE"
          | "USER_NOT_FOUND";
        message: string;
      };
      success: false;
    };

export class AcceptInvitation {
  constructor(
    private readonly familyRepository: IFamilyRepository,
    private readonly invitationRepository: IInvitationRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: AcceptInvitationInput): Promise<AcceptInvitationResult> {
    const invitation = await this.invitationRepository.findByToken(input.token);

    if (!invitation) {
      return {
        error: {
          code: "INVITATION_NOT_FOUND",
          message: "Invitation not found",
        },
        success: false,
      };
    }

    const now = new Date();

    if (!invitation.isUsable(now)) {
      return {
        error: {
          code: "INVITATION_NOT_USABLE",
          message:
            "This invitation is no longer valid. It may have expired, been used, or been cancelled.",
        },
        success: false,
      };
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return {
        error: {
          code: "USER_NOT_FOUND",
          message: "Accepting user does not exist",
        },
        success: false,
      };
    }

    const family = await this.familyRepository.findById(invitation.familyId);

    if (!family) {
      return {
        error: {
          code: "FAMILY_NOT_FOUND",
          message:
            "The family associated with this invitation no longer exists",
        },
        success: false,
      };
    }

    if (family.hasMember(input.userId)) {
      return {
        error: {
          code: "ALREADY_MEMBER",
          message: "You are already a member of this family",
        },
        success: false,
      };
    }

    try {
      family.addMember({
        colorPalette: ColorPalette.create(input.colorPalette),
        role: "member",
        userId: input.userId,
      });

      invitation.markAsUsed(input.userId, now);

      await this.familyRepository.save(family);
      await this.invitationRepository.save(invitation);

      return {
        data: {
          familyId: family.id,
          familyName: family.name,
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
            code: "ALREADY_MEMBER",
            message: error.message,
          },
          success: false,
        };
      }

      throw error;
    }
  }
}
