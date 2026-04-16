import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import {
  deleteMockUser,
  findMockDelegatedUsers,
  findMockUserByEmail,
  findMockUserById,
  saveMockDomainUser,
  toDomainUser,
} from "@/infrastructure/auth/mockAuthStore";

export class MockUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = findMockUserByEmail(email);

    return user ? toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = findMockUserById(id);

    return user ? toDomainUser(user) : null;
  }

  async findDelegatedUsers(parentId: string): Promise<User[]> {
    return findMockDelegatedUsers(parentId).map(toDomainUser);
  }

  async save(user: User): Promise<void> {
    saveMockDomainUser(user);
  }

  async delete(id: string): Promise<void> {
    deleteMockUser(id);
  }
}
