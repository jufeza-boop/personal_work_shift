import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { Family } from "@/domain/entities/Family";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { User } from "@/domain/entities/User";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import { ShiftType } from "@/domain/value-objects/ShiftType";
import type { Database } from "@/infrastructure/supabase/database.types";
import { SupabaseEventRepository } from "@/infrastructure/supabase/SupabaseEventRepository";
import { SupabaseFamilyRepository } from "@/infrastructure/supabase/SupabaseFamilyRepository";
import { SupabaseUserRepository } from "@/infrastructure/supabase/SupabaseUserRepository";

interface QueryResponse<T> {
  readonly data: T;
  readonly error: Error | null;
}

interface MockBuilder<T> {
  readonly delete: ReturnType<typeof vi.fn>;
  readonly eq: ReturnType<typeof vi.fn>;
  readonly in: ReturnType<typeof vi.fn>;
  readonly maybeSingle: ReturnType<typeof vi.fn>;
  readonly order: ReturnType<typeof vi.fn>;
  readonly select: ReturnType<typeof vi.fn>;
  readonly upsert: ReturnType<typeof vi.fn>;
  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null,
  ): Promise<TResult1 | TResult2>;
}

const MIGRATION_PATH =
  "/home/runner/work/personal_work_shift/personal_work_shift/supabase/migrations/20260410090623_phase_2_infrastructure.sql";

function createBuilder<T>(response: QueryResponse<T>): MockBuilder<T> {
  const builder: MockBuilder<T> = {
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => response),
    order: vi.fn(() => builder),
    select: vi.fn(() => builder),
    upsert: vi.fn(async () => response),
    then(onfulfilled, onrejected) {
      return Promise.resolve(response).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

describe("Supabase repositories", () => {
  it("persists and reads users through the user repository", async () => {
    const findBuilder = createBuilder({
      data: {
        avatar_url: null,
        created_at: "2026-04-10T00:00:00.000Z",
        delegated_by_user_id: null,
        display_name: "Alice Example",
        email: "alice@example.com",
        id: "user-1",
        updated_at: "2026-04-10T00:00:00.000Z",
      },
      error: null,
    });
    const saveBuilder = createBuilder({
      data: null,
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(saveBuilder)
        .mockReturnValueOnce(findBuilder),
    } as unknown as SupabaseClient<Database>;

    const repository = new SupabaseUserRepository(client);
    const stored = await repository.findById("user-1");

    expect(stored).toEqual(
      new User({
        displayName: "Alice Example",
        email: "alice@example.com",
        id: "user-1",
      }),
    );

    await repository.save(
      new User({
        avatarUrl: "https://example.com/avatar.png",
        displayName: "Alice Updated",
        email: "ALICE@EXAMPLE.COM",
        id: "user-1",
      }),
    );

    expect(saveBuilder.upsert).toHaveBeenCalledWith(
      {
        avatar_url: "https://example.com/avatar.png",
        delegated_by_user_id: null,
        display_name: "Alice Updated",
        email: "alice@example.com",
        id: "user-1",
      },
      { onConflict: "id" },
    );

    await repository.findByEmail("ALICE@EXAMPLE.COM");

    expect(findBuilder.eq).toHaveBeenLastCalledWith("email", "alice@example.com");
  });

  it("persists and reads families through the family repository", async () => {
    const membershipBuilder = createBuilder({
      data: [{ family_id: "family-1" }],
      error: null,
    });
    const familyRow = {
      created_at: "2026-04-10T00:00:00.000Z",
      created_by: "owner-1",
      family_members: [
        {
          color_palette: null,
          delegated_by_user_id: null,
          family_id: "family-1",
          id: "membership-1",
          joined_at: "2026-04-10T00:00:00.000Z",
          role: "owner" as const,
          user_id: "owner-1",
        },
        {
          color_palette: "sky",
          delegated_by_user_id: null,
          family_id: "family-1",
          id: "membership-2",
          joined_at: "2026-04-10T00:00:00.000Z",
          role: "member" as const,
          user_id: "member-1",
        },
      ],
      id: "family-1",
      name: "Core Team",
      updated_at: "2026-04-10T00:00:00.000Z",
    };
    const findBuilder = createBuilder({
      data: familyRow,
      error: null,
    });
    const listBuilder = createBuilder({
      data: [familyRow],
      error: null,
    });
    const saveFamilyBuilder = createBuilder({
      data: null,
      error: null,
    });
    const saveMembersBuilder = createBuilder({
      data: null,
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(membershipBuilder)
        .mockReturnValueOnce(listBuilder)
        .mockReturnValueOnce(saveFamilyBuilder)
        .mockReturnValueOnce(saveMembersBuilder),
    } as unknown as SupabaseClient<Database>;

    const repository = new SupabaseFamilyRepository(client);
    const stored = await repository.findById("family-1");
    const listed = await repository.findByUserId("member-1");
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [
        {
          colorPalette: ColorPalette.create("sky"),
          role: "member",
          userId: "member-1",
        },
      ],
      name: "Core Team",
    });

    await repository.save(family);

    expect(stored).toEqual(family);
    expect(listed).toEqual([family]);
    expect(saveFamilyBuilder.upsert).toHaveBeenCalledWith(
      {
        created_by: "owner-1",
        id: "family-1",
        name: "Core Team",
      },
      { onConflict: "id" },
    );
    expect(saveMembersBuilder.upsert).toHaveBeenCalledWith(
      [
        {
          color_palette: null,
          delegated_by_user_id: null,
          family_id: "family-1",
          role: "owner",
          user_id: "owner-1",
        },
        {
          color_palette: "sky",
          delegated_by_user_id: null,
          family_id: "family-1",
          role: "member",
          user_id: "member-1",
        },
      ],
      { onConflict: "family_id,user_id" },
    );
  });

  it("persists and reads punctual and recurring events through the event repository", async () => {
    const punctualEventId = randomUUID();
    const recurringEventId = randomUUID();
    const findPunctualBuilder = createBuilder({
      data: {
        category: null,
        created_at: "2026-04-10T00:00:00.000Z",
        created_by: "owner-1",
        description: "One-time event",
        end_date: null,
        end_time: "10:30:00",
        event_date: "2026-04-10",
        event_type: "punctual" as const,
        family_id: "family-1",
        frequency_interval: null,
        frequency_unit: null,
        id: punctualEventId,
        parent_event_id: null,
        shift_type: null,
        start_date: null,
        start_time: "09:00:00",
        title: "Dentist appointment",
        updated_at: "2026-04-10T00:00:00.000Z",
      },
      error: null,
    });
    const findRecurringBuilder = createBuilder({
      data: {
        category: "work" as const,
        created_at: "2026-04-10T00:00:00.000Z",
        created_by: "owner-1",
        description: null,
        end_date: "2026-05-01",
        end_time: null,
        event_date: null,
        event_type: "recurring" as const,
        family_id: "family-1",
        frequency_interval: 1,
        frequency_unit: "weekly" as const,
        id: recurringEventId,
        parent_event_id: null,
        shift_type: "night" as const,
        start_date: "2026-04-11",
        start_time: null,
        title: "Night shift",
        updated_at: "2026-04-10T00:00:00.000Z",
      },
      error: null,
    });
    const listBuilder = createBuilder({
      data: [findPunctualBuilder.then.bind(findPunctualBuilder), findRecurringBuilder.then.bind(findRecurringBuilder)],
      error: null,
    });
    const savePunctualBuilder = createBuilder({
      data: null,
      error: null,
    });
    const saveRecurringBuilder = createBuilder({
      data: null,
      error: null,
    });
    const deleteBuilder = createBuilder({
      data: null,
      error: null,
    });
    const client = {
      from: vi
        .fn()
        .mockReturnValueOnce(savePunctualBuilder)
        .mockReturnValueOnce(saveRecurringBuilder)
        .mockReturnValueOnce(findPunctualBuilder)
        .mockReturnValueOnce(findRecurringBuilder)
        .mockReturnValueOnce(
          createBuilder({
            data: [
              await findPunctualBuilder.maybeSingle().then((result) => result.data),
              await findRecurringBuilder.maybeSingle().then((result) => result.data),
            ],
            error: null,
          }),
        )
        .mockReturnValueOnce(deleteBuilder),
    } as unknown as SupabaseClient<Database>;

    const repository = new SupabaseEventRepository(client);
    const punctualEvent = new PunctualEvent({
      createdBy: "owner-1",
      date: new Date("2026-04-10T00:00:00.000Z"),
      description: "One-time event",
      endTime: "10:30",
      familyId: "family-1",
      id: punctualEventId,
      startTime: "09:00",
      title: "Dentist appointment",
    });
    const recurringEvent = new RecurringEvent({
      category: "work",
      createdBy: "owner-1",
      endDate: new Date("2026-05-01T00:00:00.000Z"),
      familyId: "family-1",
      frequency: EventFrequency.create("weekly", 1),
      id: recurringEventId,
      shiftType: ShiftType.create("night"),
      startDate: new Date("2026-04-11T00:00:00.000Z"),
      title: "Night shift",
    });

    await repository.save(punctualEvent);
    await repository.save(recurringEvent);

    const punctualStored = await repository.findById(punctualEventId);
    const recurringStored = await repository.findById(recurringEventId);
    const listed = await repository.findByFamilyId("family-1");

    await repository.delete(punctualEventId);

    expect(savePunctualBuilder.upsert).toHaveBeenCalled();
    expect(saveRecurringBuilder.upsert).toHaveBeenCalled();
    expect(punctualStored).toEqual(punctualEvent);
    expect(recurringStored).toEqual(recurringEvent);
    expect(listed).toEqual([punctualEvent, recurringEvent]);
    expect(deleteBuilder.delete).toHaveBeenCalled();
    expect(deleteBuilder.eq).toHaveBeenCalledWith("id", punctualEventId);
  });
});

describe("Phase 2 migration", () => {
  const migration = readFileSync(MIGRATION_PATH, "utf8");

  it("creates the required core tables", () => {
    expect(migration).toContain("create table public.users");
    expect(migration).toContain("create table public.families");
    expect(migration).toContain("create table public.family_members");
    expect(migration).toContain("create table public.events");
    expect(migration).toContain("create table public.event_exceptions");
  });

  it("defines row-level security policies for all phase 2 tables", () => {
    expect(migration).toContain("create policy users_select_own");
    expect(migration).toContain("create policy families_select_member");
    expect(migration).toContain("create policy family_members_select_member");
    expect(migration).toContain("create policy events_select_family");
    expect(migration).toContain("create policy event_exceptions_select_family");
  });

  it("defines helper functions and indexes needed by repository queries", () => {
    expect(migration).toContain("create or replace function public.handle_auth_user()");
    expect(migration).toContain("create or replace function public.is_family_member");
    expect(migration).toContain("create index events_family_id_created_at_idx");
    expect(migration).toContain("create index family_members_user_id_idx");
  });
});
