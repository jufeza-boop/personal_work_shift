import { render, screen } from "@testing-library/react";
import { Family } from "@/domain/entities/Family";
import { ColorPalette } from "@/domain/value-objects/ColorPalette";
import { FamilyMemberList } from "@/presentation/components/family/FamilyMemberList";

describe("FamilyMemberList", () => {
  it("renders member names, roles, and palette assignments", () => {
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
      name: "Home Team",
    });

    const memberDirectory = new Map([
      ["owner-1", "Alice Example"],
      ["member-1", "Bob Example"],
    ]);

    render(
      <FamilyMemberList family={family} memberDirectory={memberDirectory} />,
    );

    expect(screen.getByText("Alice Example")).toBeInTheDocument();
    expect(screen.getByText("Propietario")).toBeInTheDocument();
    expect(screen.getByText("Bob Example")).toBeInTheDocument();
    expect(screen.getByText("Miembro")).toBeInTheDocument();
    // Palette is rendered as a colored swatch with aria-label
    expect(screen.getByLabelText("Paleta sky")).toBeInTheDocument();
  });

  it("shows 'Sin paleta' for members without a color palette", () => {
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });

    const memberDirectory = new Map([["owner-1", "Alice Example"]]);

    render(
      <FamilyMemberList family={family} memberDirectory={memberDirectory} />,
    );

    expect(screen.getByText("Sin paleta")).toBeInTheDocument();
  });

  it("does not show remove buttons when isOwner is false", () => {
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ userId: "member-1", role: "member" }],
      name: "Home Team",
    });

    const memberDirectory = new Map([
      ["owner-1", "Alice"],
      ["member-1", "Bob"],
    ]);

    render(
      <FamilyMemberList family={family} memberDirectory={memberDirectory} />,
    );

    expect(
      screen.queryByRole("button", { name: /quitar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows remove buttons for non-owner members when isOwner is true", () => {
    const mockAction = vi.fn().mockResolvedValue({ success: false });
    const family = new Family({
      createdBy: "owner-1",
      id: "family-1",
      members: [{ userId: "member-1", role: "member" }],
      name: "Home Team",
    });

    const memberDirectory = new Map([
      ["owner-1", "Alice"],
      ["member-1", "Bob"],
    ]);

    render(
      <FamilyMemberList
        family={family}
        memberDirectory={memberDirectory}
        isOwner
        removeMemberAction={mockAction}
      />,
    );

    // Should have a remove button for Bob but not for Alice (owner)
    expect(
      screen.getByRole("button", { name: /eliminar a bob/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /eliminar a alice/i }),
    ).not.toBeInTheDocument();
  });
});
