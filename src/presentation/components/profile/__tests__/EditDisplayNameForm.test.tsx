import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditDisplayNameForm } from "@/presentation/components/profile/EditDisplayNameForm";

vi.mock("react-dom", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-dom")>();

  return {
    ...original,
    useFormStatus: vi.fn().mockReturnValue({ pending: false }),
  };
});

const noopAction = vi.fn().mockResolvedValue({ success: false });
const successAction = vi.fn().mockResolvedValue({ success: true });
const errorAction = vi.fn().mockResolvedValue({
  errors: { displayName: "El nombre no puede estar vacío." },
  success: false,
});
const messageAction = vi.fn().mockResolvedValue({
  message: "No se pudo actualizar el nombre. Inténtalo de nuevo.",
  success: false,
});

describe("EditDisplayNameForm", () => {
  it("renders the display name field pre-filled with the initial value", () => {
    const onSuccess = vi.fn();

    render(
      <EditDisplayNameForm
        action={noopAction}
        initialDisplayName="Alice Example"
        onSuccess={onSuccess}
      />,
    );

    const input = screen.getByLabelText("Nombre");

    expect(input).toHaveValue("Alice Example");
  });

  it("renders a submit button", () => {
    render(
      <EditDisplayNameForm
        action={noopAction}
        initialDisplayName="Alice"
        onSuccess={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /guardar cambios/i }),
    ).toBeInTheDocument();
  });

  it("calls onSuccess when the action returns success", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <EditDisplayNameForm
        action={successAction}
        initialDisplayName="Alice"
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(onSuccess).toHaveBeenCalledWith("Nombre actualizado correctamente.");
  });

  it("shows a field error when the action returns a displayName error", async () => {
    const user = userEvent.setup();

    render(
      <EditDisplayNameForm
        action={errorAction}
        initialDisplayName=""
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(
      await screen.findByText("El nombre no puede estar vacío."),
    ).toBeInTheDocument();
  });

  it("shows a general message when the action returns a message error", async () => {
    const user = userEvent.setup();

    render(
      <EditDisplayNameForm
        action={messageAction}
        initialDisplayName="Alice"
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(
      await screen.findByText(
        "No se pudo actualizar el nombre. Inténtalo de nuevo.",
      ),
    ).toBeInTheDocument();
  });
});
