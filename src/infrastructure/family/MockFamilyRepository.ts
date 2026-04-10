import { Family } from "@/domain/entities/Family";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import {
  findMockFamiliesByUserId,
  findMockFamilyById,
  saveMockFamily,
} from "@/infrastructure/family/mockFamilyStore";

export class MockFamilyRepository implements IFamilyRepository {
  async findById(id: string): Promise<Family | null> {
    return findMockFamilyById(id);
  }

  async findByUserId(userId: string): Promise<Family[]> {
    return findMockFamiliesByUserId(userId);
  }

  async save(family: Family): Promise<void> {
    saveMockFamily(family);
  }
}
