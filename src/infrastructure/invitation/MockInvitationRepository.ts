import type { Invitation } from "@/domain/entities/Invitation";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import {
  deleteMockInvitation,
  findMockInvitationById,
  findMockInvitationByToken,
  findMockInvitationsByFamilyId,
  saveMockInvitation,
} from "@/infrastructure/invitation/mockInvitationStore";

export class MockInvitationRepository implements IInvitationRepository {
  async findById(id: string): Promise<Invitation | null> {
    return findMockInvitationById(id);
  }

  async findByToken(token: string): Promise<Invitation | null> {
    return findMockInvitationByToken(token);
  }

  async findByFamilyId(familyId: string): Promise<Invitation[]> {
    return findMockInvitationsByFamilyId(familyId);
  }

  async save(invitation: Invitation): Promise<void> {
    saveMockInvitation(invitation);
  }

  async delete(id: string): Promise<void> {
    deleteMockInvitation(id);
  }
}
