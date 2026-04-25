import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "@/presentation/components/profile/ChangePasswordForm";

vi.mock("react-dom", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-dom")>();

  return {
    ...original,
    useFormStatus: vi.fn().mockReturnValue({ pending: false }),
  };
});

const noopAction = vi.fn().mockResolvedValue({ success: false });
const successAction = vi.fn().mockResolvedValue({ success: true });
const passwordMismatchAction = vi.fn().mockResolvedValue({
  errors: { confirmPassword: "Las contraseñas no coinciden." },
  success: false,
});
const weakPasswordAction = vi.fn().mockResolvedValue({
  errors: {
    newPassword:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
  },
  success: false,
});

describe("ChangePasswordForm", () => {
  it("renders the new password and confirm password fields", () => {
    render(<ChangePasswordForm action={noopAction} onSuccess={vi.fn()} />);

    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirmar nueva contraseña"),
    ).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<ChangePasswordForm action={noopAction} onSuccess={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    ).toBeInTheDocument();
  });

  it("calls onSuccess and resets the form when the action returns success", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<ChangePasswordForm action={successAction} onSuccess={onSuccess} />);

    const newPasswordInput = screen.getByLabelText("Nueva contraseña");
    const confirmPasswordInput = screen.getByLabelText(
      "Confirmar nueva contraseña",
    );

    await user.type(newPasswordInput, "NewPass123");
    await user.type(confirmPasswordInput, "NewPass123");
    await user.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    expect(onSuccess).toHaveBeenCalledWith(
      "Contraseña actualizada correctamente.",
    );
    // Form should be reset — inputs should be empty
    expect(newPasswordInput).toHaveValue("");
    expect(confirmPasswordInput).toHaveValue("");
  });

  it("shows a confirmPassword error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(
      <ChangePasswordForm
        action={passwordMismatchAction}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden."),
    ).toBeInTheDocument();
  });

  it("shows a newPassword error when the password is weak", async () => {
    const user = userEvent.setup();

    render(
      <ChangePasswordForm action={weakPasswordAction} onSuccess={vi.fn()} />,
    );

    await user.click(
      screen.getByRole("button", { name: /cambiar contraseña/i }),
    );

    expect(
      await screen.findByText(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      ),
    ).toBeInTheDocument();
  });
});
