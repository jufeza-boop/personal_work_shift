import type { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import type {
  Database,
  UserRow,
} from "@/infrastructure/supabase/database.types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapUser(row: UserRow): User {
  return new User({
    avatarUrl: row.avatar_url,
    delegatedByUserId: row.delegated_by_user_id,
    displayName: row.display_name,
    email: row.email,
    id: row.id,
  });
}

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await this.client.rpc("lookup_user_by_email", {
      target_email: normalizedEmail,
    });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;

    return row
      ? mapUser({
          avatar_url: row.avatar_url,
          created_at: row.created_at,
          delegated_by_user_id: row.delegated_by_user_id,
          display_name: row.display_name,
          email: row.email,
          id: row.id,
          updated_at: row.updated_at,
        })
      : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client.rpc(
      "lookup_family_member_user",
      { target_user_id: id },
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;

    return row
      ? mapUser({
          avatar_url: row.avatar_url,
          created_at: row.created_at,
          delegated_by_user_id: row.delegated_by_user_id,
          display_name: row.display_name,
          email: row.email,
          id: row.id,
          updated_at: row.updated_at,
        })
      : null;
  }

  async save(user: User): Promise<void> {
    const normalizedEmail = normalizeEmail(user.email);

    const { error } = await this.client.from("users").upsert(
      {
        avatar_url: user.avatarUrl,
        delegated_by_user_id: user.delegatedByUserId,
        display_name: user.displayName,
        email: normalizedEmail,
        id: user.id,
      },
      {
        onConflict: "id",
      },
    );

    if (error) {
      throw error;
    }
  }
}
