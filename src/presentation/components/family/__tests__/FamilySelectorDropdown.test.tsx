import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Family } from "@/domain/entities/Family";
import { FamilySelectorDropdown } from "@/presentation/components/family/FamilySelectorDropdown";

describe("FamilySelectorDropdown", () => {
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

  it("renders nothing when there are fewer than 2 families", () => {
    const { container } = render(
      <FamilySelectorDropdown
        action={async () => {}}
        activeFamilyId="family-1"
        families={[primaryFamily]}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders a dropdown with family options when there are 2+ families", () => {
    render(
      <FamilySelectorDropdown
        action={async () => {}}
        activeFamilyId="family-2"
        families={[primaryFamily, secondaryFamily]}
      />,
    );

    const select = screen.getByRole("combobox", { name: /familia/i });
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Home Team");
    expect(options[1]).toHaveTextContent("Work Team");
  });

  it("has the active family pre-selected", () => {
    render(
      <FamilySelectorDropdown
        action={async () => {}}
        activeFamilyId="family-2"
        families={[primaryFamily, secondaryFamily]}
      />,
    );

    const select = screen.getByRole("combobox", { name: /familia/i });
    expect(select).toHaveValue("family-2");
  });

  it("renders nothing when families list is empty", () => {
    const { container } = render(
      <FamilySelectorDropdown
        action={async () => {}}
        activeFamilyId={null}
        families={[]}
      />,
    );

    expect(container.innerHTML).toBe("");
  });
});
