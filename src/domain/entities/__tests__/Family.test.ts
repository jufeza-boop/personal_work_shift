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
});
