import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/presentation/components/auth/LoginForm";

describe("LoginForm", () => {
  it("renders the login fields and status message", () => {
    render(
      <LoginForm
        action={async () => ({ success: false })}
        state={{
          message: "Tu sesión se cerró correctamente.",
          success: false,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByText("Tu sesión se cerró correctamente."),
    ).toBeInTheDocument();
  });
});
