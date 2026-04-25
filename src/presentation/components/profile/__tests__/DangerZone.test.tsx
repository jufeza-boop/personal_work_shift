import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DangerZone } from "@/presentation/components/profile/DangerZone";

const successDeleteAction = vi.fn().mockResolvedValue({ success: true });
const failingDeleteAction = vi.fn().mockResolvedValue({
  message: "No se pudo eliminar la cuenta.",
  success: false,
});

describe("DangerZone", () => {
  it("renders the delete account button", () => {
    render(<DangerZone deleteAccountAction={successDeleteAction} />);

    expect(
      screen.getByRole("button", { name: /eliminar cuenta/i }),
    ).toBeInTheDocument();
  });

  it("opens a confirmation dialog when the delete button is clicked", async () => {
    const user = userEvent.setup();

    render(<DangerZone deleteAccountAction={successDeleteAction} />);

    await user.click(screen.getByRole("button", { name: /eliminar cuenta/i }));

    const dialog = screen.getByRole("dialog", { name: /eliminar tu cuenta/i });

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/permanente e irreversible/i);
    expect(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("closes the dialog when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(<DangerZone deleteAccountAction={successDeleteAction} />);

    await user.click(screen.getByRole("button", { name: /eliminar cuenta/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls deleteAccountAction when the confirm button is clicked", async () => {
    const user = userEvent.setup();

    render(<DangerZone deleteAccountAction={successDeleteAction} />);

    await user.click(screen.getByRole("button", { name: /eliminar cuenta/i }));
    await user.click(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    );

    expect(successDeleteAction).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when deleteAccountAction returns a failure", async () => {
    const user = userEvent.setup();

    render(<DangerZone deleteAccountAction={failingDeleteAction} />);

    await user.click(screen.getByRole("button", { name: /eliminar cuenta/i }));
    await user.click(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo eliminar la cuenta.",
    );
  });
});
