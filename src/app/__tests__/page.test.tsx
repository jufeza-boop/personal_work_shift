import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("shows the app hero heading in Spanish", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /organiza los turnos de toda tu familia en un solo lugar/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows login and register links", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /registrarse/i }),
    ).toBeInTheDocument();
  });
});
