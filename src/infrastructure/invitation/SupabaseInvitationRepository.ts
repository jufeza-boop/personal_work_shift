import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Invitation,
  type InvitationStatus,
} from "@/domain/entities/Invitation";
import type { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import type { Database } from "@/infrastructure/supabase/database.types";

type InvitationRow = Database["public"]["Tables"]["family_invitations"]["Row"];

function mapInvitation(row: InvitationRow): Invitation {
  return new Invitation({
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    expiresAt: new Date(row.expires_at),
    familyId: row.family_id,
    familyName: row.family_name,
    id: row.id,
    status: row.status as InvitationStatus,
    token: row.token,
    usedAt: row.used_at ? new Date(row.used_at) : null,
    usedBy: row.used_by,
  });
}

export class SupabaseInvitationRepository implements IInvitationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Invitation | null> {
    const { data, error } = await this.client
      .from("family_invitations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapInvitation(data) : null;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await this.client
      .from("family_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) throw error;
    return data ? mapInvitation(data) : null;
  }

  async findByFamilyId(familyId: string): Promise<Invitation[]> {
    const { data, error } = await this.client
      .from("family_invitations")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapInvitation);
  }

  async save(invitation: Invitation): Promise<void> {
    const { error } = await this.client.from("family_invitations").upsert(
      {
        created_at: invitation.createdAt.toISOString(),
        created_by: invitation.createdBy,
        expires_at: invitation.expiresAt.toISOString(),
        family_id: invitation.familyId,
        family_name: invitation.familyName,
        id: invitation.id,
        status: invitation.status,
        token: invitation.token,
        used_at: invitation.usedAt ? invitation.usedAt.toISOString() : null,
        used_by: invitation.usedBy,
      },
      { onConflict: "id" },
    );

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("family_invitations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
