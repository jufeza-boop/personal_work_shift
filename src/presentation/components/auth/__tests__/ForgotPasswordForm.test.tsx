import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "@/presentation/components/auth/ForgotPasswordForm";

// Mock the server actions
vi.mock("@/app/actions/auth", () => ({
  requestPasswordResetAction: vi.fn(),
  verifyOtpAction: vi.fn(),
  updatePasswordAction: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import {
  requestPasswordResetAction,
  verifyOtpAction,
  updatePasswordAction,
} from "@/app/actions/auth";

const mockRequestReset = vi.mocked(requestPasswordResetAction);
const mockVerifyOtp = vi.mocked(verifyOtpAction);
const mockUpdatePassword = vi.mocked(updatePasswordAction);

async function goToOtpStep() {
  mockRequestReset.mockResolvedValue({ success: true });
  render(<ForgotPasswordForm />);

  const emailForm = (
    await screen.findByRole("button", { name: "Enviar código" })
  ).closest("form")!;
  fireEvent.submit(emailForm);

  return screen.findByRole("button", { name: "Verificar código" });
}

async function goToPasswordStep() {
  mockVerifyOtp.mockResolvedValue({ success: true });
  const verifyBtn = await goToOtpStep();
  fireEvent.submit(verifyBtn.closest("form")!);

  return screen.findByRole("button", { name: "Guardar contraseña" });
}

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestReset.mockResolvedValue({ success: false });
    mockVerifyOtp.mockResolvedValue({ success: false });
    mockUpdatePassword.mockResolvedValue({ success: false });
  });

  it("renders step 1 with email input and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(
      screen.getByRole("heading", { name: "Recuperar contraseña" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar código" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver al inicio de sesión" }),
    ).toBeInTheDocument();
  });

  it("shows email validation error when server returns field error", async () => {
    mockRequestReset.mockResolvedValue({
      success: false,
      errors: { email: "Introduce un correo electrónico válido." },
    });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar código",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Introduce un correo electrónico válido."),
      ).toBeInTheDocument();
    });
  });

  it("shows general error message from server on email step", async () => {
    mockRequestReset.mockResolvedValue({
      success: false,
      message: "No se pudo enviar el código. Inténtalo de nuevo.",
    });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar código",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo enviar el código. Inténtalo de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("transitions to OTP step after successful email submission", async () => {
    mockRequestReset.mockResolvedValue({ success: true });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar código",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    expect(
      await screen.findByRole("heading", { name: "Introduce el código" }),
    ).toBeInTheDocument();
  });

  it("shows resend button in OTP step", async () => {
    const verifyBtn = await goToOtpStep();
    expect(verifyBtn).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reenviar" }),
    ).toBeInTheDocument();
  });

  it("shows OTP error when code is invalid", async () => {
    mockVerifyOtp.mockResolvedValue({
      success: false,
      message: "El código no es válido. Compuébalo e inténtalo de nuevo.",
    });

    const verifyBtn = await goToOtpStep();
    fireEvent.submit(verifyBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "El código no es válido. Compuébalo e inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("transitions to password step after successful OTP verification", async () => {
    const saveBtn = await goToPasswordStep();

    expect(
      screen.getByRole("heading", { name: "Nueva contraseña" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(saveBtn).toBeInTheDocument();
  });

  it("shows password confirmation mismatch error from server", async () => {
    const saveBtn = await goToPasswordStep();

    mockUpdatePassword.mockResolvedValue({
      success: false,
      errors: { confirmPassword: "Las contraseñas no coinciden." },
    });

    fireEvent.submit(saveBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Las contraseñas no coinciden."),
      ).toBeInTheDocument();
    });
  });

  it("shows weak password error from server", async () => {
    mockUpdatePassword.mockResolvedValue({
      success: false,
      errors: {
        password:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      },
    });

    const saveBtn = await goToPasswordStep();
    fireEvent.submit(saveBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("goes back to email step when resend is clicked", async () => {
    await goToOtpStep();

    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));

    expect(
      screen.getByRole("heading", { name: "Recuperar contraseña" }),
    ).toBeInTheDocument();
  });
});
