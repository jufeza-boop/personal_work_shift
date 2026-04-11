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
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

interface StoredFamilyMember {
  colorPaletteName: string | null;
  delegatedByUserId: string | null;
  role: "delegated" | "member" | "owner";
  userId: string;
}

interface StoredFamily {
  createdBy: string;
  id: string;
  members: StoredFamilyMember[];
  name: string;
}

interface MockFamilyStoreShape {
  familiesById: Record<string, StoredFamily>;
}

const STORE_PATH = join(
  tmpdir(),
  "personal-work-shift",
  "mock-family-store.json",
);

function ensureStoreDirectory(): void {
  const directory = dirname(STORE_PATH);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function getStore(): MockFamilyStoreShape {
  ensureStoreDirectory();

  if (!existsSync(STORE_PATH)) {
    return {
      familiesById: {},
    };
  }

  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf8")) as MockFamilyStoreShape;
  } catch {
    return {
      familiesById: {},
    };
  }
}

function saveStore(store: MockFamilyStoreShape): void {
  ensureStoreDirectory();
  const tempStorePath = `${STORE_PATH}.${randomUUID()}.tmp`;

  try {
    writeFileSync(tempStorePath, JSON.stringify(store), "utf8");
    renameSync(tempStorePath, STORE_PATH);
  } catch (error) {
    throw new Error(
      `Unable to persist the mock family store at ${STORE_PATH}: ${
        error instanceof Error ? error.message : "unknown error"
      }. Check that the directory is writable and that enough disk space is available.`,
    );
  }
}

function serializeFamily(family: Family): StoredFamily {
  return {
    createdBy: family.createdBy,
    id: family.id,
    members: family.members.map((member) => ({
      colorPaletteName: member.colorPalette?.name ?? null,
      delegatedByUserId: member.delegatedByUserId,
      role: member.role,
      userId: member.userId,
    })),
    name: family.name,
  };
}

export function toDomainFamily(storedFamily: StoredFamily): Family {
  return new Family({
    createdBy: storedFamily.createdBy,
    id: storedFamily.id,
    members: storedFamily.members.map((member) => ({
      colorPalette: member.colorPaletteName
        ? ColorPalette.create(member.colorPaletteName)
        : null,
      delegatedByUserId: member.delegatedByUserId,
      role: member.role,
      userId: member.userId,
    })),
    name: storedFamily.name,
  });
}

export function findMockFamilyById(id: string): Family | null {
  const storedFamily = getStore().familiesById[id];

  return storedFamily ? toDomainFamily(storedFamily) : null;
}

export function findMockFamiliesByUserId(userId: string): Family[] {
  return Object.values(getStore().familiesById)
    .filter((family) =>
      family.members.some((member) => member.userId === userId),
    )
    .map(toDomainFamily);
}

export function saveMockFamily(family: Family): void {
  const store = getStore();

  store.familiesById[family.id] = serializeFamily(family);
  saveStore(store);
}
