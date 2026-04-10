import { render, screen } from "@testing-library/react";
import { RegisterForm } from "@/presentation/components/auth/RegisterForm";

describe("RegisterForm", () => {
  it("renders the registration fields and error messages", () => {
    render(
      <RegisterForm
        action={async () => ({ success: false })}
        state={{
          errors: {
            displayName: "Introduce tu nombre.",
            email: "Introduce un correo válido.",
            password: "La contraseña no es segura.",
          },
          message: "No se pudo crear la cuenta.",
          success: false,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByText("Introduce tu nombre.")).toBeInTheDocument();
    expect(screen.getByText("Introduce un correo válido.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña no es segura.")).toBeInTheDocument();
    expect(screen.getByText("No se pudo crear la cuenta.")).toBeInTheDocument();
  });
});
