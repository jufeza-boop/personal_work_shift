import { randomUUID } from "node:crypto";
import { User } from "@/domain/entities/User";

export const MOCK_SESSION_COOKIE = "pws-mock-session";

interface MockStoredUser {
  displayName: string;
  email: string;
  id: string;
  password: string;
}

interface MockAuthStoreShape {
  usersByEmail: Map<string, MockStoredUser>;
  usersById: Map<string, MockStoredUser>;
}

function getStore(): MockAuthStoreShape {
  const globalStore = globalThis as typeof globalThis & {
    __PERSONAL_WORK_SHIFT_MOCK_AUTH__?: MockAuthStoreShape;
  };

  if (!globalStore.__PERSONAL_WORK_SHIFT_MOCK_AUTH__) {
    globalStore.__PERSONAL_WORK_SHIFT_MOCK_AUTH__ = {
      usersByEmail: new Map<string, MockStoredUser>(),
      usersById: new Map<string, MockStoredUser>(),
    };
  }

  return globalStore.__PERSONAL_WORK_SHIFT_MOCK_AUTH__;
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

  store.usersByEmail.set(user.email, user);
  store.usersById.set(user.id, user);

  return user;
}

export function findMockUserByEmail(email: string): MockStoredUser | null {
  return getStore().usersByEmail.get(normalizeEmail(email)) ?? null;
}

export function findMockUserById(id: string): MockStoredUser | null {
  return getStore().usersById.get(id) ?? null;
}

export function saveMockDomainUser(user: User, password = "Password1"): void {
  const storedUser: MockStoredUser = {
    displayName: user.displayName,
    email: normalizeEmail(user.email),
    id: user.id,
    password,
  };
  const store = getStore();

  store.usersByEmail.set(storedUser.email, storedUser);
  store.usersById.set(storedUser.id, storedUser);
}

export function toDomainUser(user: MockStoredUser): User {
  return new User({
    displayName: user.displayName,
    email: user.email,
    id: user.id,
  });
}
