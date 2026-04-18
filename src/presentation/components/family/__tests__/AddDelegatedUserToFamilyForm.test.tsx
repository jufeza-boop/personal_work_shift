import { render, screen } from "@testing-library/react";
import { AddDelegatedUserToFamilyForm } from "@/presentation/components/family/AddDelegatedUserToFamilyForm";

const mockAction = vi.fn().mockResolvedValue({ success: false });

const defaultPaletteOptions = [
  { disabled: false, name: "sky" as const },
  { disabled: false, name: "rose" as const },
];

describe("AddDelegatedUserToFamilyForm", () => {
  it("renders nothing when no delegated users are available", () => {
    const { container } = render(
      <AddDelegatedUserToFamilyForm
        action={mockAction}
        availableDelegatedUsers={[]}
        familyId="family-1"
        paletteOptions={defaultPaletteOptions}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("renders the select dropdown with available delegated users", () => {
    render(
      <AddDelegatedUserToFamilyForm
        action={mockAction}
        availableDelegatedUsers={[
          { displayName: "Junior", id: "delegated-1" },
          { displayName: "Sis", id: "delegated-2" },
        ]}
        familyId="family-1"
        paletteOptions={defaultPaletteOptions}
      />,
    );

    expect(
      screen.getByText("Añadir usuario delegado a esta familia"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Usuario delegado")).toBeInTheDocument();
    expect(screen.getByText("Junior")).toBeInTheDocument();
    expect(screen.getByText("Sis")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /añadir a la familia/i }),
    ).toBeInTheDocument();
  });
});
