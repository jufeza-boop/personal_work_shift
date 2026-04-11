import { describe, expect, it } from "vitest";
import {
  createFamilySchema,
  inviteFamilyMemberSchema,
  renameFamilySchema,
} from "@/presentation/validation/familySchemas";

describe("familySchemas", () => {
  it("validates family names with the domain limits", () => {
    expect(
      createFamilySchema.safeParse({
        name: "a".repeat(101),
      }).success,
    ).toBe(false);

    expect(
      renameFamilySchema.safeParse({
        name: "Work Team",
      }).success,
    ).toBe(true);
  });

  it("validates member invitations with email and palette", () => {
    expect(
      inviteFamilyMemberSchema.safeParse({
        colorPalette: "sky",
        email: "member@example.com",
      }).success,
    ).toBe(true);

    expect(
      inviteFamilyMemberSchema.safeParse({
        colorPalette: "unknown",
        email: "member@example.com",
      }).success,
    ).toBe(false);
  });
});
