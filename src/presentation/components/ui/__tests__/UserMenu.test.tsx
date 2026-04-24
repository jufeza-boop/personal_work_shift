import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/presentation/components/ui/UserMenu";

const mockLogoutAction = vi.fn().mockResolvedValue(undefined);
const mockDeleteAccountAction = vi.fn().mockResolvedValue({ success: true });

describe("UserMenu", () => {
  it("shows the user initial as the trigger", () => {
    render(
      <UserMenu
        email="test@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    expect(screen.getByLabelText("Menú de usuario")).toHaveTextContent("T");
  });

  it("renders email, delegated users link, logout, and delete account buttons in the dropdown", () => {
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Usuarios delegados")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /eliminar mi cuenta/i }),
    ).toBeInTheDocument();
  });

  it("starts closed — details element has no open attribute", () => {
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    expect(screen.getByTestId("user-menu")).not.toHaveAttribute("open");
  });

  it("opens when summary is clicked and closes on Escape key", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    const details = screen.getByTestId("user-menu");
    const summary = screen.getByLabelText("Menú de usuario");

    // Click summary to open
    await user.click(summary);
    expect(details).toHaveAttribute("open");

    // Pressing Escape should close
    fireEvent.keyDown(details, { key: "Escape" });
    expect(details).not.toHaveAttribute("open");
  });

  it("has a link to the delegated users page", () => {
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    const link = screen.getByText("Usuarios delegados");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/calendar/delegated-users",
    );
  });

  it("shows a confirmation dialog when delete account button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar mi cuenta/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /eliminar tu cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("closes the confirmation dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar mi cuenta/i }),
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls deleteAccountAction when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={mockDeleteAccountAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar mi cuenta/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    );

    expect(mockDeleteAccountAction).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when deleteAccountAction returns a failure", async () => {
    const failingDelete = vi.fn().mockResolvedValue({
      message: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
      success: false,
    });
    const user = userEvent.setup();
    render(
      <UserMenu
        email="alice@example.com"
        logoutAction={mockLogoutAction}
        deleteAccountAction={failingDelete}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /eliminar mi cuenta/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /sí, eliminar cuenta/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
    );
  });
});
