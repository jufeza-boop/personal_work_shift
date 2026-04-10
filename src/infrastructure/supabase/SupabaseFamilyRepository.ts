import type { SupabaseClient } from "@supabase/supabase-js";
import { Family, type FamilyMemberRole } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type {
  Database,
  FamilyMemberRow,
  FamilyRow,
} from "@/infrastructure/supabase/database.types";

interface FamilyRowWithMembers extends FamilyRow {
  family_members: FamilyMemberRow[];
}

const FAMILY_SELECT = `
  id,
  name,
  created_by,
  family_members (
    family_id,
    user_id,
    role,
    color_palette,
    delegated_by_user_id,
    id,
    joined_at
  )
`;

function mapFamily(row: FamilyRowWithMembers): Family {
  // The family creator is the canonical owner in the domain model, so we
  // synthesize that member from the family record and ignore any duplicated
  // owner row from the relation payload.
  const ownerMember = {
    colorPalette: null,
    delegatedByUserId: null,
    role: "owner" as const,
    userId: row.created_by,
  };
  const nonOwnerMembers = row.family_members
    .filter((member) => member.user_id !== row.created_by)
    .map((member) => ({
      colorPalette: member.color_palette
        ? ColorPalette.create(member.color_palette)
        : null,
      delegatedByUserId: member.delegated_by_user_id,
      role: member.role,
      userId: member.user_id,
    }));

  return new Family({
    createdBy: row.created_by,
    id: row.id,
    members: [ownerMember, ...nonOwnerMembers],
    name: row.name,
  });
}

export class SupabaseFamilyRepository implements IFamilyRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private mapMembers(family: Family) {
    return family.members.map((member) => ({
      color_palette: member.colorPalette?.name ?? null,
      delegated_by_user_id: member.delegatedByUserId,
      family_id: family.id,
      role: member.role satisfies FamilyMemberRole,
      user_id: member.userId,
    }));
  }

  async findById(id: string): Promise<Family | null> {
    const { data, error } = await this.client
      .from("families")
      .select(FAMILY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapFamily(data as unknown as FamilyRowWithMembers) : null;
  }

  async findByUserId(userId: string): Promise<Family[]> {
    const membershipResponse = await this.client
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId);

    if (membershipResponse.error) {
      throw membershipResponse.error;
    }

    const familyIds = membershipResponse.data.map(
      (membership) => membership.family_id,
    );

    if (familyIds.length === 0) {
      return [];
    }

    const familiesResponse = await this.client
      .from("families")
      .select(FAMILY_SELECT)
      .in("id", familyIds)
      .order("created_at", { ascending: true });

    if (familiesResponse.error) {
      throw familiesResponse.error;
    }

    return (familiesResponse.data as unknown as FamilyRowWithMembers[]).map(
      mapFamily,
    );
  }

  async save(family: Family): Promise<void> {
    const existingMembersResponse = await this.client
      .from("family_members")
      .select("user_id")
      .eq("family_id", family.id);

    if (existingMembersResponse.error) {
      throw existingMembersResponse.error;
    }

    const existingMembers = existingMembersResponse.data ?? [];
    const isNewFamily = existingMembers.length === 0;
    const members = this.mapMembers(family);
    const ownerMember = members.find((member) => member.user_id === family.createdBy);

    if (!ownerMember) {
      throw new Error(
        `Cannot save family ${family.id}: owner membership is missing. ` +
          "The family creator must be included as a member with the owner role.",
      );
    }

    if (isNewFamily) {
      const familyInsert = await this.client.from("families").insert({
        created_by: family.createdBy,
        id: family.id,
        name: family.name,
      });

      if (familyInsert.error) {
        throw familyInsert.error;
      }

      const ownerInsert = await this.client
        .from("family_members")
        .insert(ownerMember);

      if (ownerInsert.error) {
        throw ownerInsert.error;
      }

      const additionalMembers = members.filter(
        (member) => member.user_id !== family.createdBy,
      );

      if (additionalMembers.length === 0) {
        return;
      }

      const additionalMembersUpsert = await this.client
        .from("family_members")
        .upsert(additionalMembers, {
          onConflict: "family_id,user_id",
        });

      if (additionalMembersUpsert.error) {
        throw additionalMembersUpsert.error;
      }

      return;
    }

    const familyUpdate = await this.client
      .from("families")
      .update({
        name: family.name,
      })
      .eq("id", family.id)
      .eq("created_by", family.createdBy);

    if (familyUpdate.error) {
      throw familyUpdate.error;
    }

    const targetMemberIds = new Set(
      family.members.map((member) => member.userId),
    );
    const removedMemberIds = existingMembers
      .map((member) => member.user_id)
      .filter((memberId) => !targetMemberIds.has(memberId));

    if (removedMemberIds.length > 0) {
      const deleteResponse = await this.client
        .from("family_members")
        .delete()
        .eq("family_id", family.id)
        .in("user_id", removedMemberIds);

      if (deleteResponse.error) {
        throw deleteResponse.error;
      }
    }

    const membersUpsert = await this.client
      .from("family_members")
      .upsert(members, {
        onConflict: "family_id,user_id",
      });

    if (membersUpsert.error) {
      throw membersUpsert.error;
    }
  }
}
