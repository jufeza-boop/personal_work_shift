import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  Invitation,
  type InvitationStatus,
} from "@/domain/entities/Invitation";

interface StoredInvitation {
  createdAt: string;
  createdBy: string;
  expiresAt: string;
  familyId: string;
  familyName: string;
  id: string;
  status: InvitationStatus;
  token: string;
  usedAt: string | null;
  usedBy: string | null;
}

interface MockInvitationStoreShape {
  invitationsById: Record<string, StoredInvitation>;
}

const STORE_PATH = join(
  tmpdir(),
  "personal-work-shift",
  "mock-invitation-store.json",
);

function ensureStoreDirectory(): void {
  const directory = dirname(STORE_PATH);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function getStore(): MockInvitationStoreShape {
  ensureStoreDirectory();

  if (!existsSync(STORE_PATH)) {
    return { invitationsById: {} };
  }

  try {
    return JSON.parse(
      readFileSync(STORE_PATH, "utf8"),
    ) as MockInvitationStoreShape;
  } catch {
    return { invitationsById: {} };
  }
}

function saveStore(store: MockInvitationStoreShape): void {
  ensureStoreDirectory();
  const tempPath = `${STORE_PATH}.${randomUUID()}.tmp`;

  try {
    writeFileSync(tempPath, JSON.stringify(store), "utf8");
    renameSync(tempPath, STORE_PATH);
  } catch (error) {
    throw new Error(
      `Unable to persist the mock invitation store at ${STORE_PATH}: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }
}

function serialize(invitation: Invitation): StoredInvitation {
  return {
    createdAt: invitation.createdAt.toISOString(),
    createdBy: invitation.createdBy,
    expiresAt: invitation.expiresAt.toISOString(),
    familyId: invitation.familyId,
    familyName: invitation.familyName,
    id: invitation.id,
    status: invitation.status,
    token: invitation.token,
    usedAt: invitation.usedAt ? invitation.usedAt.toISOString() : null,
    usedBy: invitation.usedBy,
  };
}

function deserialize(stored: StoredInvitation): Invitation {
  return new Invitation({
    createdAt: new Date(stored.createdAt),
    createdBy: stored.createdBy,
    expiresAt: new Date(stored.expiresAt),
    familyId: stored.familyId,
    familyName: stored.familyName,
    id: stored.id,
    status: stored.status,
    token: stored.token,
    usedAt: stored.usedAt ? new Date(stored.usedAt) : null,
    usedBy: stored.usedBy,
  });
}

export function findMockInvitationById(id: string): Invitation | null {
  const stored = getStore().invitationsById[id];
  return stored ? deserialize(stored) : null;
}

export function findMockInvitationByToken(token: string): Invitation | null {
  const stored = Object.values(getStore().invitationsById).find(
    (inv) => inv.token === token,
  );
  return stored ? deserialize(stored) : null;
}

export function findMockInvitationsByFamilyId(familyId: string): Invitation[] {
  return Object.values(getStore().invitationsById)
    .filter((inv) => inv.familyId === familyId)
    .map(deserialize);
}

export function saveMockInvitation(invitation: Invitation): void {
  const store = getStore();
  store.invitationsById[invitation.id] = serialize(invitation);
  saveStore(store);
}

export function deleteMockInvitation(id: string): void {
  const store = getStore();
  delete store.invitationsById[id];
  saveStore(store);
}
