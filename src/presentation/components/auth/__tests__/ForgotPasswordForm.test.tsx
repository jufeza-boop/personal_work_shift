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
    await screen.findByRole("button", { name: "Enviar c\u00f3digo" })
  ).closest("form")!;
  fireEvent.submit(emailForm);

  return screen.findByRole("button", { name: "Verificar c\u00f3digo" });
}

async function goToPasswordStep() {
  mockVerifyOtp.mockResolvedValue({ success: true });
  const verifyBtn = await goToOtpStep();
  fireEvent.submit(verifyBtn.closest("form")!);

  return screen.findByRole("button", { name: "Guardar contrase\u00f1a" });
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
      screen.getByRole("heading", { name: "Recuperar contrase\u00f1a" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Correo electr\u00f3nico"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar c\u00f3digo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver al inicio de sesi\u00f3n" }),
    ).toBeInTheDocument();
  });

  it("shows email validation error when server returns field error", async () => {
    mockRequestReset.mockResolvedValue({
      success: false,
      errors: { email: "Introduce un correo electr\u00f3nico v\u00e1lido." },
    });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar c\u00f3digo",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Introduce un correo electr\u00f3nico v\u00e1lido."),
      ).toBeInTheDocument();
    });
  });

  it("shows general error message from server on email step", async () => {
    mockRequestReset.mockResolvedValue({
      success: false,
      message: "No se pudo enviar el c\u00f3digo. Int\u00e9ntalo de nuevo.",
    });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar c\u00f3digo",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No se pudo enviar el c\u00f3digo. Int\u00e9ntalo de nuevo.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("transitions to OTP step after successful email submission", async () => {
    mockRequestReset.mockResolvedValue({ success: true });

    render(<ForgotPasswordForm />);

    const emailBtn = await screen.findByRole("button", {
      name: "Enviar c\u00f3digo",
    });
    fireEvent.submit(emailBtn.closest("form")!);

    expect(
      await screen.findByRole("heading", { name: "Introduce el c\u00f3digo" }),
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
      message:
        "El c\u00f3digo no es v\u00e1lido. Compu\u00e9balo e int\u00e9ntalo de nuevo.",
    });

    const verifyBtn = await goToOtpStep();
    fireEvent.submit(verifyBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "El c\u00f3digo no es v\u00e1lido. Compu\u00e9balo e int\u00e9ntalo de nuevo.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("transitions to password step after successful OTP verification", async () => {
    const saveBtn = await goToPasswordStep();

    expect(
      screen.getByRole("heading", { name: "Nueva contrase\u00f1a" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contrase\u00f1a")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirmar contrase\u00f1a"),
    ).toBeInTheDocument();
    expect(saveBtn).toBeInTheDocument();
  });

  it("shows password mismatch error from server", async () => {
    mockUpdatePassword.mockResolvedValue({
      success: false,
      errors: { displayName: "Las contrase\u00f1as no coinciden." },
    });

    const saveBtn = await goToPasswordStep();
    fireEvent.submit(saveBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText("Las contrase\u00f1as no coinciden."),
      ).toBeInTheDocument();
    });
  });

  it("shows weak password error from server", async () => {
    mockUpdatePassword.mockResolvedValue({
      success: false,
      errors: {
        password:
          "La contrase\u00f1a debe tener al menos 8 caracteres, una may\u00fascula, una min\u00fascula y un n\u00famero.",
      },
    });

    const saveBtn = await goToPasswordStep();
    fireEvent.submit(saveBtn.closest("form")!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "La contrase\u00f1a debe tener al menos 8 caracteres, una may\u00fascula, una min\u00fascula y un n\u00famero.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("goes back to email step when resend is clicked", async () => {
    await goToOtpStep();

    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));

    expect(
      screen.getByRole("heading", { name: "Recuperar contrase\u00f1a" }),
    ).toBeInTheDocument();
  });
});
