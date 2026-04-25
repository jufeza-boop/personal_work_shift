import { describe, expect, it } from "vitest";
import {
  Invitation,
  INVITATION_EXPIRY_DAYS,
} from "@/domain/entities/Invitation";
import { ValidationError } from "@/domain/errors/DomainError";

function makeProps(
  overrides: Partial<ConstructorParameters<typeof Invitation>[0]> = {},
) {
  const now = new Date("2026-01-01T10:00:00Z");
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  return {
    createdAt: now,
    createdBy: "user-1",
    expiresAt,
    familyId: "family-1",
    familyName: "Los García",
    id: "inv-1",
    status: "active" as const,
    token: "tok-abc123",
    ...overrides,
  };
}

describe("Invitation entity", () => {
  describe("construction", () => {
    it("creates a valid invitation", () => {
      const inv = new Invitation(makeProps());
      expect(inv.id).toBe("inv-1");
      expect(inv.familyId).toBe("family-1");
      expect(inv.familyName).toBe("Los García");
      expect(inv.createdBy).toBe("user-1");
      expect(inv.token).toBe("tok-abc123");
      expect(inv.status).toBe("active");
      expect(inv.usedBy).toBeNull();
      expect(inv.usedAt).toBeNull();
    });

    it("throws when id is empty", () => {
      expect(() => new Invitation(makeProps({ id: "" }))).toThrow(
        ValidationError,
      );
    });

    it("throws when familyId is empty", () => {
      expect(() => new Invitation(makeProps({ familyId: "" }))).toThrow(
        ValidationError,
      );
    });

    it("throws when familyName is empty", () => {
      expect(() => new Invitation(makeProps({ familyName: "" }))).toThrow(
        ValidationError,
      );
    });

    it("throws when createdBy is empty", () => {
      expect(() => new Invitation(makeProps({ createdBy: "" }))).toThrow(
        ValidationError,
      );
    });

    it("throws when token is empty", () => {
      expect(() => new Invitation(makeProps({ token: "" }))).toThrow(
        ValidationError,
      );
    });
  });

  describe("isExpired", () => {
    it("returns false when expiry is in the future", () => {
      const inv = new Invitation(makeProps());
      const beforeExpiry = new Date("2026-01-03T10:00:00Z");
      expect(inv.isExpired(beforeExpiry)).toBe(false);
    });

    it("returns true when expiry has passed", () => {
      const inv = new Invitation(makeProps());
      const afterExpiry = new Date("2026-01-30T10:00:00Z");
      expect(inv.isExpired(afterExpiry)).toBe(true);
    });
  });

  describe("isUsable", () => {
    it("returns true for active non-expired invitation", () => {
      const inv = new Invitation(makeProps());
      const now = new Date("2026-01-02T10:00:00Z");
      expect(inv.isUsable(now)).toBe(true);
    });

    it("returns false for expired invitation", () => {
      const inv = new Invitation(makeProps());
      const future = new Date("2026-02-01T10:00:00Z");
      expect(inv.isUsable(future)).toBe(false);
    });

    it("returns false for cancelled invitation", () => {
      const inv = new Invitation(makeProps({ status: "cancelled" }));
      const now = new Date("2026-01-02T10:00:00Z");
      expect(inv.isUsable(now)).toBe(false);
    });

    it("returns false for used invitation", () => {
      const inv = new Invitation(makeProps({ status: "used" }));
      const now = new Date("2026-01-02T10:00:00Z");
      expect(inv.isUsable(now)).toBe(false);
    });
  });

  describe("cancel", () => {
    it("sets status to cancelled", () => {
      const inv = new Invitation(makeProps());
      inv.cancel();
      expect(inv.status).toBe("cancelled");
    });

    it("throws when already cancelled", () => {
      const inv = new Invitation(makeProps({ status: "cancelled" }));
      expect(() => inv.cancel()).toThrow(ValidationError);
    });

    it("throws when already used", () => {
      const inv = new Invitation(makeProps({ status: "used" }));
      expect(() => inv.cancel()).toThrow(ValidationError);
    });

    it("throws when expired status", () => {
      const inv = new Invitation(makeProps({ status: "expired" }));
      expect(() => inv.cancel()).toThrow(ValidationError);
    });
  });

  describe("markAsUsed", () => {
    it("sets status to used and records usedBy and usedAt", () => {
      const inv = new Invitation(makeProps());
      const usedAt = new Date("2026-01-02T12:00:00Z");
      inv.markAsUsed("user-2", usedAt);
      expect(inv.status).toBe("used");
      expect(inv.usedBy).toBe("user-2");
      expect(inv.usedAt).toEqual(usedAt);
    });

    it("throws when invitation is not active", () => {
      const inv = new Invitation(makeProps({ status: "cancelled" }));
      expect(() =>
        inv.markAsUsed("user-2", new Date("2026-01-02T12:00:00Z")),
      ).toThrow(ValidationError);
    });

    it("throws when invitation is expired", () => {
      const inv = new Invitation(makeProps());
      const afterExpiry = new Date("2026-02-01T00:00:00Z");
      expect(() => inv.markAsUsed("user-2", afterExpiry)).toThrow(
        ValidationError,
      );
    });
  });

  describe("computeCurrentStatus", () => {
    it("returns active when not expired and status is active", () => {
      const inv = new Invitation(makeProps());
      expect(inv.computeCurrentStatus(new Date("2026-01-02T00:00:00Z"))).toBe(
        "active",
      );
    });

    it("returns expired when expiry has passed and status is active", () => {
      const inv = new Invitation(makeProps());
      expect(inv.computeCurrentStatus(new Date("2026-02-01T00:00:00Z"))).toBe(
        "expired",
      );
    });

    it("returns used when status is used, regardless of time", () => {
      const inv = new Invitation(makeProps({ status: "used" }));
      expect(inv.computeCurrentStatus(new Date("2025-01-01T00:00:00Z"))).toBe(
        "used",
      );
    });

    it("returns cancelled when status is cancelled, regardless of time", () => {
      const inv = new Invitation(makeProps({ status: "cancelled" }));
      expect(inv.computeCurrentStatus(new Date("2025-01-01T00:00:00Z"))).toBe(
        "cancelled",
      );
    });
  });
});
