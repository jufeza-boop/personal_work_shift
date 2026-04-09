import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("shows the Phase 0 landing message in Spanish", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Organiza los turnos de toda tu familia en un solo lugar.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Base de proyecto lista: Next.js, Tailwind, Shadcn/ui, pruebas y PWA.",
      ),
    ).toBeInTheDocument();
  });
});
