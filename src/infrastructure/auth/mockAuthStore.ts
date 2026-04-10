import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { User } from "@/domain/entities/User";

export const MOCK_SESSION_COOKIE = "pws-mock-session";

interface MockStoredUser {
  displayName: string;
  email: string;
  id: string;
  password: string;
}

interface MockAuthStoreShape {
  usersByEmail: Record<string, MockStoredUser>;
  usersById: Record<string, MockStoredUser>;
}

const STORE_PATH = join(
  tmpdir(),
  "personal-work-shift",
  "mock-auth-store.json",
);

function ensureStoreDirectory(): void {
  const directory = dirname(STORE_PATH);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function getStore(): MockAuthStoreShape {
  ensureStoreDirectory();

  if (!existsSync(STORE_PATH)) {
    return {
      usersByEmail: {},
      usersById: {},
    };
  }

  return JSON.parse(readFileSync(STORE_PATH, "utf8")) as MockAuthStoreShape;
}

function saveStore(store: MockAuthStoreShape): void {
  ensureStoreDirectory();
  const tempStorePath = `${STORE_PATH}.tmp`;

  writeFileSync(tempStorePath, JSON.stringify(store), "utf8");
  renameSync(tempStorePath, STORE_PATH);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createMockUser(input: {
  displayName: string;
  email: string;
  password: string;
}): MockStoredUser {
  const user: MockStoredUser = {
    displayName: input.displayName.trim(),
    email: normalizeEmail(input.email),
    id: randomUUID(),
    password: input.password,
  };

  const store = getStore();

  store.usersByEmail[user.email] = user;
  store.usersById[user.id] = user;
  saveStore(store);

  return user;
}

export function findMockUserByEmail(email: string): MockStoredUser | null {
  return getStore().usersByEmail[normalizeEmail(email)] ?? null;
}

export function findMockUserById(id: string): MockStoredUser | null {
  return getStore().usersById[id] ?? null;
}

export function saveMockDomainUser(user: User, password = "Password1"): void {
  const storedUser: MockStoredUser = {
    displayName: user.displayName,
    email: normalizeEmail(user.email),
    id: user.id,
    password,
  };
  const store = getStore();

  store.usersByEmail[storedUser.email] = storedUser;
  store.usersById[storedUser.id] = storedUser;
  saveStore(store);
}

export function toDomainUser(user: MockStoredUser): User {
  return new User({
    displayName: user.displayName,
    email: user.email,
    id: user.id,
  });
}
