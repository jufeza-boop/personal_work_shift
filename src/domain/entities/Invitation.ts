import { ValidationError } from "@/domain/errors/DomainError";

export type InvitationStatus = "active" | "cancelled" | "expired" | "used";

export const INVITATION_EXPIRY_DAYS = 7;

export interface InvitationProps {
  createdAt: Date;
  createdBy: string;
  expiresAt: Date;
  familyId: string;
  familyName: string;
  id: string;
  status: InvitationStatus;
  token: string;
  usedAt?: Date | null;
  usedBy?: string | null;
}

export class Invitation {
  public readonly id: string;
  public readonly familyId: string;
  public readonly familyName: string;
  public readonly createdBy: string;
  public readonly token: string;
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public status: InvitationStatus;
  public usedAt: Date | null;
  public usedBy: string | null;

  constructor(props: InvitationProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError("Invitation id is required");
    }

    if (!props.familyId || props.familyId.trim().length === 0) {
      throw new ValidationError("Invitation familyId is required");
    }

    if (!props.familyName || props.familyName.trim().length === 0) {
      throw new ValidationError("Invitation familyName is required");
    }

    if (!props.createdBy || props.createdBy.trim().length === 0) {
      throw new ValidationError("Invitation createdBy is required");
    }

    if (!props.token || props.token.trim().length === 0) {
      throw new ValidationError("Invitation token is required");
    }

    this.id = props.id;
    this.familyId = props.familyId;
    this.familyName = props.familyName;
    this.createdBy = props.createdBy;
    this.token = props.token;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.usedAt = props.usedAt ?? null;
    this.usedBy = props.usedBy ?? null;
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  isUsable(now: Date = new Date()): boolean {
    return this.status === "active" && !this.isExpired(now);
  }

  cancel(): void {
    if (this.status !== "active") {
      throw new ValidationError("Only active invitations can be cancelled");
    }

    this.status = "cancelled";
  }

  markAsUsed(usedBy: string, usedAt: Date = new Date()): void {
    if (!this.isUsable(usedAt)) {
      throw new ValidationError(
        "Invitation is not usable: it is expired, already used, or cancelled",
      );
    }

    this.status = "used";
    this.usedBy = usedBy;
    this.usedAt = usedAt;
  }

  computeCurrentStatus(now: Date = new Date()): InvitationStatus {
    if (this.status === "used" || this.status === "cancelled") {
      return this.status;
    }

    return this.isExpired(now) ? "expired" : "active";
  }
}
