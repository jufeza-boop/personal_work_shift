import { Family } from "@/domain/entities/Family";

export interface IFamilyRepository {
  findById(id: string): Promise<Family | null>;
  findByUserId(userId: string): Promise<Family[]>;
  save(family: Family): Promise<void>;
  delete(id: string): Promise<void>;
}
