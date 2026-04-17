import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RemoveFamilyMemberButton } from "@/presentation/components/family/RemoveFamilyMemberButton";

const mockAction = vi.fn().mockResolvedValue({ success: false });

describe("RemoveFamilyMemberButton", () => {
  it("shows a remove button initially", () => {
    render(
      <RemoveFamilyMemberButton
        action={mockAction}
        familyId="family-1"
        memberName="Alice"
        memberUserId="member-1"
      />,
    );

    expect(
      screen.getByRole("button", { name: /eliminar a alice/i }),
    ).toBeInTheDocument();
  });

  it("shows confirmation buttons when remove is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RemoveFamilyMemberButton
        action={mockAction}
        familyId="family-1"
        memberName="Alice"
        memberUserId="member-1"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar a alice/i }),
    );

    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirmar/i }),
    ).toBeInTheDocument();
  });

  it("hides confirmation when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RemoveFamilyMemberButton
        action={mockAction}
        familyId="family-1"
        memberName="Alice"
        memberUserId="member-1"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar a alice/i }),
    );
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(
      screen.getByRole("button", { name: /eliminar a alice/i }),
    ).toBeInTheDocument();
  });
});
