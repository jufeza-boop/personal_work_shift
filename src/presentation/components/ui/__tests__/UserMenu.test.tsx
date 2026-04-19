import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/presentation/components/ui/UserMenu";

const mockLogoutAction = vi.fn().mockResolvedValue(undefined);

describe("UserMenu", () => {
  it("shows the user initial as the trigger", () => {
    render(
      <UserMenu email="test@example.com" logoutAction={mockLogoutAction} />,
    );

    expect(screen.getByLabelText("Menú de usuario")).toHaveTextContent("T");
  });

  it("renders email, delegated users link, and logout button in the dropdown", () => {
    render(
      <UserMenu email="alice@example.com" logoutAction={mockLogoutAction} />,
    );

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Usuarios delegados")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
  });

  it("starts closed — details element has no open attribute", () => {
    render(
      <UserMenu email="alice@example.com" logoutAction={mockLogoutAction} />,
    );

    expect(screen.getByTestId("user-menu")).not.toHaveAttribute("open");
  });

  it("opens when summary is clicked and closes on Escape key", async () => {
    const user = userEvent.setup();
    render(
      <UserMenu email="alice@example.com" logoutAction={mockLogoutAction} />,
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
      <UserMenu email="alice@example.com" logoutAction={mockLogoutAction} />,
    );

    const link = screen.getByText("Usuarios delegados");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/calendar/delegated-users",
    );
  });
});
