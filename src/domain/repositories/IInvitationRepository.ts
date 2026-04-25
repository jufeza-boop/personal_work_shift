import { Invitation } from "@/domain/entities/Invitation";

export interface IInvitationRepository {
  findById(id: string): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  findByFamilyId(familyId: string): Promise<Invitation[]>;
  save(invitation: Invitation): Promise<void>;
  delete(id: string): Promise<void>;
}
