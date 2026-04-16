import { User } from "@/domain/entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findDelegatedUsers(parentId: string): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
