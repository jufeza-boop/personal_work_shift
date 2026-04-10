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
    expect(screen.getByText("Paleta sky")).toBeInTheDocument();
  });
});
