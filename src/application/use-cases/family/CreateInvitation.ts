import { randomUUID } from "node:crypto";
import {
  Invitation,
  INVITATION_EXPIRY_DAYS,
} from "@/domain/entities/Invitation";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";

export interface CreateInvitationInput {
  familyId: string;
  requestedBy: string;
}

export type CreateInvitationResult =
  | {
      data: {
        invitation: Invitation;
      };
      success: true;
    }
  | {
      error: {
        code: "FAMILY_NOT_FOUND" | "FORBIDDEN";
        message: string;
      };
      success: false;
    };

export class CreateInvitation {
  constructor(
    private readonly familyRepository: IFamilyRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async execute(input: CreateInvitationInput): Promise<CreateInvitationResult> {
    const family = await this.familyRepository.findById(input.familyId);

    if (!family) {
      return {
        error: {
          code: "FAMILY_NOT_FOUND",
          message: "The requested family does not exist",
        },
        success: false,
      };
    }

    if (family.createdBy !== input.requestedBy) {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Only the family owner can create invitations",
        },
        success: false,
      };
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = new Invitation({
      createdAt: now,
      createdBy: input.requestedBy,
      expiresAt,
      familyId: family.id,
      familyName: family.name,
      id: randomUUID(),
      status: "active",
      token: randomUUID(),
    });

    await this.invitationRepository.save(invitation);

    return {
      data: { invitation },
      success: true,
    };
  }
}
