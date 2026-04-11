import { render, screen } from "@testing-library/react";
import { Family } from "@/domain/entities/Family";
import { FamilySelectorPanel } from "@/presentation/components/family/FamilySelectorPanel";

describe("FamilySelectorPanel", () => {
  it("renders the available families and highlights the active one", () => {
    const primaryFamily = new Family({
      createdBy: "owner-1",
      id: "family-1",
      name: "Home Team",
    });
    const secondaryFamily = new Family({
      createdBy: "owner-1",
      id: "family-2",
      name: "Work Team",
    });

    render(
      <FamilySelectorPanel
        action={async () => {}}
        activeFamilyId="family-2"
        families={[primaryFamily, secondaryFamily]}
      />,
    );

    expect(screen.getByText("Familias")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Home Team" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Work Team (actual)" }),
    ).toBeInTheDocument();
  });
});
