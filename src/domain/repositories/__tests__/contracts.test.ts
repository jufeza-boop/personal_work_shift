import { describe, expectTypeOf, it, vi } from "vitest";
import type { Event } from "@/domain/entities/Event";
import { Family } from "@/domain/entities/Family";
import { User } from "@/domain/entities/User";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

describe("domain repository contracts", () => {
  it("defines the user repository contract", () => {
    const repository = {
      findByEmail: vi.fn<() => Promise<User | null>>(),
      findById: vi.fn<() => Promise<User | null>>(),
      save: vi.fn<() => Promise<void>>(),
    } satisfies IUserRepository;

    expectTypeOf(repository).toMatchTypeOf<IUserRepository>();
  });

  it("defines the family repository contract", () => {
    const repository = {
      findById: vi.fn<() => Promise<Family | null>>(),
      findByUserId: vi.fn<() => Promise<Family[]>>(),
      save: vi.fn<() => Promise<void>>(),
    } satisfies IFamilyRepository;

    expectTypeOf(repository).toMatchTypeOf<IFamilyRepository>();
  });

  it("defines the event repository contract", () => {
    const repository = {
      delete: vi.fn<() => Promise<void>>(),
      findByFamilyId: vi.fn<() => Promise<Event[]>>(),
      findById: vi.fn<() => Promise<Event | null>>(),
      save: vi.fn<() => Promise<void>>(),
      saveException: vi.fn<() => Promise<void>>(),
    } satisfies IEventRepository;

    expectTypeOf(repository).toMatchTypeOf<IEventRepository>();
  });
});
