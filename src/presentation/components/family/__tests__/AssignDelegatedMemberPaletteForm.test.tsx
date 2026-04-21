import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssignDelegatedMemberPaletteForm } from "@/presentation/components/family/AssignDelegatedMemberPaletteForm";

const mockAction = vi.fn().mockResolvedValue({ success: false });

const paletteOptions = [
  { name: "sky" as const, disabled: false },
  { name: "rose" as const, disabled: false },
  { name: "amber" as const, disabled: true },
];

describe("AssignDelegatedMemberPaletteForm", () => {
  it("renders 'Asignar paleta' button when no current palette", () => {
    render(
      <AssignDelegatedMemberPaletteForm
        action={mockAction}
        familyId="f1"
        targetUserId="u1"
        memberName="Junior"
        paletteOptions={paletteOptions}
      />,
    );
    expect(
      screen.getByRole("button", { name: /asignar paleta/i }),
    ).toBeInTheDocument();
  });

  it("renders 'Cambiar paleta' button when current palette is set", () => {
    render(
      <AssignDelegatedMemberPaletteForm
        action={mockAction}
        familyId="f1"
        targetUserId="u1"
        memberName="Junior"
        currentPalette="sky"
        paletteOptions={paletteOptions}
      />,
    );
    expect(
      screen.getByRole("button", { name: /cambiar paleta/i }),
    ).toBeInTheDocument();
  });

  it("shows the palette picker form when the button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AssignDelegatedMemberPaletteForm
        action={mockAction}
        familyId="f1"
        targetUserId="u1"
        memberName="Junior"
        paletteOptions={paletteOptions}
      />,
    );

    await user.click(screen.getByRole("button", { name: /asignar paleta/i }));

    expect(screen.getByText(/paleta de junior/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar paleta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("hides the picker and resets selection when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AssignDelegatedMemberPaletteForm
        action={mockAction}
        familyId="f1"
        targetUserId="u1"
        memberName="Junior"
        currentPalette="sky"
        paletteOptions={paletteOptions}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cambiar paleta/i }));
    expect(screen.getByText(/paleta de junior/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByText(/paleta de junior/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cambiar paleta/i }),
    ).toBeInTheDocument();
  });

  it("renders hidden inputs for familyId, targetUserId, and redirectTo", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AssignDelegatedMemberPaletteForm
        action={mockAction}
        familyId="f1"
        targetUserId="u1"
        memberName="Junior"
        paletteOptions={paletteOptions}
      />,
    );

    await user.click(screen.getByRole("button", { name: /asignar paleta/i }));

    const hiddenInputs = container.querySelectorAll("input[type='hidden']");
    const names = Array.from(hiddenInputs).map((el) => el.getAttribute("name"));
    expect(names).toContain("familyId");
    expect(names).toContain("targetUserId");
    expect(names).toContain("redirectTo");
  });
});
