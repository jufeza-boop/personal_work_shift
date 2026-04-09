import { ValidationError } from "@/domain/errors/DomainError";

export interface UserProps {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  delegatedByUserId?: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly displayName: string;
  public readonly avatarUrl: string | null;
  public readonly delegatedByUserId: string | null;

  constructor(props: UserProps) {
    const email = props.email.trim().toLowerCase();
    const displayName = props.displayName.trim();

    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationError("User email must be a valid email address");
    }

    if (displayName.length === 0) {
      throw new ValidationError("User display name cannot be empty");
    }

    this.id = props.id;
    this.email = email;
    this.displayName = displayName;
    this.avatarUrl = props.avatarUrl?.trim() || null;
    this.delegatedByUserId = props.delegatedByUserId ?? null;
  }

  isDelegated(): boolean {
    return this.delegatedByUserId !== null;
  }
}
