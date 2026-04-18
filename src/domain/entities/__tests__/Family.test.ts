import { describe, expect, it } from "vitest";
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";

describe("Family", () => {
  it("creates the owner membership automatically", () => {
    const family = new Family({
      id: "family-1",
      name: "  Home  ",
      createdBy: "owner-1",
    });

    expect(family.name).toBe("Home");
    expect(family.hasMember("owner-1")).toBe(true);
    expect(family.members).toEqual([
      {
        userId: "owner-1",
        role: "owner",
        colorPalette: null,
        delegatedByUserId: null,
      },
    ]);
  });

  it("rejects names longer than one hundred characters", () => {
    expect(
      () =>
        new Family({
          id: "family-2",
          name: "a".repeat(101),
          createdBy: "owner-1",
        }),
    ).toThrow("Family name must be between 1 and 100 characters");
  });

  it("prevents duplicate color palettes inside the same family", () => {
    const family = new Family({
      id: "family-3",
      name: "Home",
      createdBy: "owner-1",
    });

    family.addMember({
      userId: "member-1",
      role: "member",
      colorPalette: ColorPalette.create("sky"),
    });

    expect(() =>
      family.addMember({
        userId: "member-2",
        role: "member",
        colorPalette: ColorPalette.create("sky"),
      }),
    ).toThrow("Color palette sky is already assigned in this family");
  });

  describe("updateMemberPalette", () => {
    it("updates a member's palette to a free palette", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
        members: [
          {
            userId: "member-1",
            role: "member",
            colorPalette: ColorPalette.create("rose"),
          },
        ],
      });

      family.updateMemberPalette("member-1", ColorPalette.create("sky"));

      const member = family.members.find((m) => m.userId === "member-1");
      expect(member?.colorPalette?.name).toBe("sky");
    });

    it("allows a member to re-select their own current palette", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
        members: [
          {
            userId: "member-1",
            role: "member",
            colorPalette: ColorPalette.create("sky"),
          },
        ],
      });

      expect(() =>
        family.updateMemberPalette("member-1", ColorPalette.create("sky")),
      ).not.toThrow();
    });

    it("rejects a palette already taken by another member", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
        members: [
          {
            userId: "member-1",
            role: "member",
            colorPalette: ColorPalette.create("rose"),
          },
          {
            userId: "member-2",
            role: "member",
            colorPalette: ColorPalette.create("sky"),
          },
        ],
      });

      expect(() =>
        family.updateMemberPalette("member-1", ColorPalette.create("sky")),
      ).toThrow("Color palette sky is already assigned in this family");
    });

    it("allows clearing a member's palette by passing null", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
        members: [
          {
            userId: "member-1",
            role: "member",
            colorPalette: ColorPalette.create("sky"),
          },
        ],
      });

      family.updateMemberPalette("member-1", null);

      const member = family.members.find((m) => m.userId === "member-1");
      expect(member?.colorPalette).toBeNull();
    });

    it("throws when the user is not a family member", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
      });

      expect(() =>
        family.updateMemberPalette("stranger", ColorPalette.create("sky")),
      ).toThrow("Member stranger is not part of this family");
    });
  });

  describe("removeMember", () => {
    it("removes an existing member from the family", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
        members: [{ userId: "member-1", role: "member" }],
      });

      family.removeMember("member-1");

      expect(family.hasMember("member-1")).toBe(false);
      expect(family.members).toHaveLength(1); // only owner remains
    });

    it("throws when removing the owner", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
      });

      expect(() => family.removeMember("owner-1")).toThrow(
        "Cannot remove the owner from the family",
      );
    });

    it("throws when the user is not a member", () => {
      const family = new Family({
        id: "family-1",
        name: "Home",
        createdBy: "owner-1",
      });

      expect(() => family.removeMember("stranger")).toThrow(
        "Member stranger is not part of this family",
      );
    });
  });
});
