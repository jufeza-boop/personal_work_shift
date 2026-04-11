import { render, screen } from "@testing-library/react";
import { SubmitButton } from "@/presentation/components/ui/SubmitButton";

// useFormStatus must be called from inside a <form> — mock react-dom to control pending state.
vi.mock("react-dom", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-dom")>();

  return {
    ...original,
    useFormStatus: vi.fn().mockReturnValue({ pending: false }),
  };
});

import { useFormStatus } from "react-dom";

describe("SubmitButton", () => {
  it("renders the label when not pending", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: false,
      action: null,
      data: null,
      method: null,
    });
    render(<SubmitButton label="Crear evento" pendingLabel="Guardando..." />);

    expect(
      screen.getByRole("button", { name: "Crear evento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear evento" }),
    ).not.toBeDisabled();
  });

  it("renders the pending label and disables the button while pending", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: true,
      action: null,
      data: null,
      method: null,
    });
    render(<SubmitButton label="Crear evento" pendingLabel="Guardando..." />);

    expect(
      screen.getByRole("button", { name: "Guardando..." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });

  it("applies an extra className when provided", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      pending: false,
      action: null,
      data: null,
      method: null,
    });
    render(
      <SubmitButton
        className="w-full"
        label="Enviar"
        pendingLabel="Enviando..."
      />,
    );

    expect(screen.getByRole("button", { name: "Enviar" })).toHaveClass(
      "w-full",
    );
  });
});
