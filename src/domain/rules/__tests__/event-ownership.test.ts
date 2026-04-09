import { describe, expect, it } from "vitest";
import {
  assertEventOwnership,
  canManageEvent,
} from "@/domain/rules/event-ownership";

describe("event ownership rule", () => {
  it("allows the event creator to manage the event", () => {
    expect(
      canManageEvent({
        actorId: "user-1",
        eventCreatorId: "user-1",
      }),
    ).toBe(true);
  });

  it("allows delegated users that were explicitly authorized", () => {
    expect(
      canManageEvent({
        actorId: "child-1",
        eventCreatorId: "parent-1",
        delegatedUserIds: ["child-1"],
      }),
    ).toBe(true);
  });

  it("rejects actors outside the ownership chain", () => {
    expect(() =>
      assertEventOwnership({
        actorId: "user-2",
        eventCreatorId: "user-1",
      }),
    ).toThrow("Only the event creator or an authorized delegated user can manage this event");
  });
});
