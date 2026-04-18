import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DelegatedUserCard } from "@/presentation/components/family/DelegatedUserCard";

const mockRemoveAction = vi.fn().mockResolvedValue({ success: false });
const mockRenameAction = vi.fn().mockResolvedValue({ success: false });

describe("DelegatedUserCard", () => {
  it("renders the delegated user name and role label", () => {
    render(
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    expect(screen.getByText("Junior")).toBeInTheDocument();
    expect(screen.getByText("Usuario delegado")).toBeInTheDocument();
  });

  it("shows the edit and delete buttons initially", () => {
    render(
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /eliminar/i }),
    ).toBeInTheDocument();
  });

  it("shows confirmation buttons when delete is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

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
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(
      screen.getByRole("button", { name: /eliminar/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /confirmar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows edit form when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByDisplayValue("Junior")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("hides edit form and restores name when cancel is clicked in edit mode", async () => {
    const user = userEvent.setup();

    render(
      <DelegatedUserCard
        delegatedUserId="delegated-1"
        displayName="Junior"
        removeAction={mockRemoveAction}
        renameAction={mockRenameAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByText("Junior")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });
});
