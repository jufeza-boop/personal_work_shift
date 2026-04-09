import { EventOwnershipError } from "@/domain/errors/DomainError";

export interface EventOwnershipParams {
  actorId: string;
  eventCreatorId: string;
  delegatedUserIds?: string[];
}

export function canManageEvent({
  actorId,
  eventCreatorId,
  delegatedUserIds = [],
}: EventOwnershipParams): boolean {
  return actorId === eventCreatorId || delegatedUserIds.includes(actorId);
}

export function assertEventOwnership(params: EventOwnershipParams): void {
  if (!canManageEvent(params)) {
    throw new EventOwnershipError();
  }
}
