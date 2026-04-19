import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InviteFamilyMemberForm } from "@/presentation/components/family/InviteFamilyMemberForm";

const mockAction = vi.fn().mockResolvedValue({ success: false });

const paletteOptions = [
  { name: "sky" as const, disabled: false },
  { name: "rose" as const, disabled: true },
];

describe("InviteFamilyMemberForm", () => {
  it("renders the email input field", () => {
    render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
      />,
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it("renders the submit button with correct label", () => {
    render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
      />,
    );

    expect(screen.getByRole("button", { name: /añadir miembro/i })).toBeInTheDocument();
  });

  it("renders a heading and description text", () => {
    render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
      />,
    );

    expect(screen.getByText(/invitar miembro/i)).toBeInTheDocument();
    expect(screen.getByText(/invita por correo/i)).toBeInTheDocument();
  });

  it("renders the palette color picker label", () => {
    render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
      />,
    );

    expect(screen.getByText(/paleta de color/i)).toBeInTheDocument();
  });

  it("renders hidden inputs for familyId and redirectTo", () => {
    const { container } = render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
      />,
    );

    const hiddenInputs = container.querySelectorAll("input[type='hidden']");
    const values = Array.from(hiddenInputs).map((el) => ({
      name: el.getAttribute("name"),
      value: el.getAttribute("value"),
    }));
    expect(values).toContainEqual({ name: "familyId", value: "f1" });
    expect(values).toContainEqual({ name: "redirectTo", value: "/calendar/settings" });
  });

  it("uses custom redirectTo when provided", () => {
    const { container } = render(
      <InviteFamilyMemberForm
        action={mockAction}
        familyId="f1"
        paletteOptions={paletteOptions}
        redirectTo="/custom-path"
      />,
    );

    const redirectInput = container.querySelector("input[name='redirectTo']");
    expect(redirectInput).toHaveAttribute("value", "/custom-path");
  });
});
