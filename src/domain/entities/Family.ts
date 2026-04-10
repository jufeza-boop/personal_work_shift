import {
  ColorPaletteAlreadyTakenError,
  ValidationError,
} from "@/domain/errors/DomainError";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

export type FamilyMemberRole = "owner" | "member" | "delegated";

export interface FamilyMember {
  userId: string;
  role: FamilyMemberRole;
  colorPalette?: ColorPalette | null;
  delegatedByUserId?: string | null;
}

export interface FamilyProps {
  id: string;
  name: string;
  createdBy: string;
  members?: FamilyMember[];
}

function normalizeName(name: string): string {
  const normalizedName = name.trim();

  if (normalizedName.length === 0 || normalizedName.length > 100) {
    throw new ValidationError(
      "Family name must be between 1 and 100 characters",
    );
  }

  return normalizedName;
}

export class Family {
  public readonly id: string;
  public readonly createdBy: string;
  public name: string;
  public readonly members: Array<{
    userId: string;
    role: FamilyMemberRole;
    colorPalette: ColorPalette | null;
    delegatedByUserId: string | null;
  }>;

  constructor(props: FamilyProps) {
    this.id = props.id;
    this.createdBy = props.createdBy;
    this.name = normalizeName(props.name);

    const normalizedMembers = (props.members ?? []).map((member) => ({
      userId: member.userId,
      role: member.role,
      colorPalette: member.colorPalette ?? null,
      delegatedByUserId: member.delegatedByUserId ?? null,
    }));

    const ownerMember = normalizedMembers.find(
      (member) => member.userId === props.createdBy,
    );

    this.members = ownerMember
      ? normalizedMembers.map((member) =>
          member.userId === props.createdBy
            ? { ...member, role: "owner" }
            : member,
        )
      : [
          {
            userId: props.createdBy,
            role: "owner",
            colorPalette: null,
            delegatedByUserId: null,
          },
          ...normalizedMembers,
        ];

    this.ensureUniqueMembers();
    this.ensureExclusiveColorPalettes();
  }

  rename(name: string): void {
    this.name = normalizeName(name);
  }

  hasMember(userId: string): boolean {
    return this.members.some((member) => member.userId === userId);
  }

  addMember(member: FamilyMember): void {
    if (this.hasMember(member.userId)) {
      throw new ValidationError(
        `Family member ${member.userId} is already part of this family`,
      );
    }

    const normalizedMember = {
      userId: member.userId,
      role: member.role,
      colorPalette: member.colorPalette ?? null,
      delegatedByUserId: member.delegatedByUserId ?? null,
    };

    if (
      normalizedMember.colorPalette &&
      !this.isColorPaletteAvailable(normalizedMember.colorPalette)
    ) {
      throw new ColorPaletteAlreadyTakenError(
        normalizedMember.colorPalette.name,
      );
    }

    this.members.push(normalizedMember);
  }

  isColorPaletteAvailable(colorPalette: ColorPalette): boolean {
    return !this.members.some(
      (member) =>
        member.colorPalette !== null &&
        member.colorPalette.equals(colorPalette),
    );
  }

  private ensureUniqueMembers(): void {
    const uniqueMemberIds = new Set(
      this.members.map((member) => member.userId),
    );

    if (uniqueMemberIds.size !== this.members.length) {
      throw new ValidationError(
        "Family members must be unique within a family",
      );
    }
  }

  private ensureExclusiveColorPalettes(): void {
    const assignedPalettes = this.members
      .map((member) => member.colorPalette)
      .filter(
        (colorPalette): colorPalette is ColorPalette => colorPalette !== null,
      );

    const uniquePaletteNames = new Set(
      assignedPalettes.map((colorPalette) => colorPalette.name),
    );

    if (uniquePaletteNames.size !== assignedPalettes.length) {
      const duplicatedPalette = assignedPalettes.find(
        (colorPalette, index) =>
          assignedPalettes.findIndex(
            (assignedPalette) => assignedPalette.name === colorPalette.name,
          ) !== index,
      );

      throw new ColorPaletteAlreadyTakenError(
        duplicatedPalette?.name ?? "unknown",
      );
    }
  }
}
