import type { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";
import type { Database, UserRow } from "@/infrastructure/supabase/database.types";

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
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapUser(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapUser(data) : null;
  }

  async save(user: User): Promise<void> {
    const normalizedEmail = user.email.trim().toLowerCase();

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
