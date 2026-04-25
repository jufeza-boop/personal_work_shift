import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { Invitation } from "@/domain/entities/Invitation";
import type { Database } from "@/infrastructure/supabase/database.types";
import { SupabaseInvitationRepository } from "@/infrastructure/invitation/SupabaseInvitationRepository";

interface QueryResponse<T> {
  readonly data: T;
  readonly error: Error | null;
}

interface MockBuilder<T> {
  readonly eq: ReturnType<typeof vi.fn>;
  readonly insert: ReturnType<typeof vi.fn>;
  readonly maybeSingle: ReturnType<typeof vi.fn>;
  readonly select: ReturnType<typeof vi.fn>;
  readonly update: ReturnType<typeof vi.fn>;
  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
}

function createBuilder<T>(response: QueryResponse<T>): MockBuilder<T> {
  const builder: MockBuilder<T> = {
    eq: vi.fn(() => builder),
    insert: vi.fn(async () => response),
    maybeSingle: vi.fn(async () => response),
    select: vi.fn(() => builder),
    update: vi.fn(() => builder),
    then(onfulfilled, onrejected) {
      return Promise.resolve(response).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

function createInvitation(): Invitation {
  return new Invitation({
    createdAt: new Date("2026-04-25T18:00:00.000Z"),
    createdBy: "owner-1",
    expiresAt: new Date("2026-05-02T18:00:00.000Z"),
    familyId: "family-1",
    familyName: "Casa",
    id: "invitation-1",
    status: "active",
    token: "11111111-1111-1111-1111-111111111111",
  });
}

describe("SupabaseInvitationRepository.save", () => {
  it("updates an existing invitation instead of using upsert", async () => {
    const selectExistingBuilder = createBuilder({
      data: { id: "invitation-1" },
      error: null,
    });
    const updateBuilder = createBuilder({
      data: null,
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(selectExistingBuilder)
        .mockReturnValueOnce(updateBuilder),
    } as unknown as SupabaseClient<Database>;

    const repository = new SupabaseInvitationRepository(client);

    await repository.save(createInvitation());

    expect(selectExistingBuilder.select).toHaveBeenCalledWith("id");
    expect(selectExistingBuilder.eq).toHaveBeenCalledWith("id", "invitation-1");
    expect(updateBuilder.update).toHaveBeenCalled();
    expect(updateBuilder.eq).toHaveBeenCalledWith("id", "invitation-1");
  });

  it("inserts when the invitation does not exist", async () => {
    const selectMissingBuilder = createBuilder({
      data: null,
      error: null,
    });
    const insertBuilder = createBuilder({
      data: null,
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(selectMissingBuilder)
        .mockReturnValueOnce(insertBuilder),
    } as unknown as SupabaseClient<Database>;

    const repository = new SupabaseInvitationRepository(client);

    await repository.save(createInvitation());

    expect(insertBuilder.insert).toHaveBeenCalled();
    expect(insertBuilder.eq).not.toHaveBeenCalled();
  });
});
