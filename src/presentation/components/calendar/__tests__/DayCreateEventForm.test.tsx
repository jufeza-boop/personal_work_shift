import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DayCreateEventForm } from "@/presentation/components/calendar/DayCreateEventForm";

describe("DayCreateEventForm", () => {
  it("renders the title input", () => {
    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it("renders tab buttons for event types", () => {
    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Puntual" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Trabajo/Estudio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Otro recurrente" }),
    ).toBeInTheDocument();
  });

  it("shows time fields for punctual tab by default", () => {
    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/hora inicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hora fin/i)).toBeInTheDocument();
  });

  it("shows work-specific fields when switching to trabajo tab", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Trabajo/Estudio" }));

    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frecuencia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de turno/i)).toBeInTheDocument();
  });

  it("shows other-recurring fields when switching to otro recurrente tab", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Otro recurrente" }));

    expect(screen.getByLabelText(/frecuencia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/intervalo/i)).toBeInTheDocument();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders the submit button", () => {
    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /crear evento/i }),
    ).toBeInTheDocument();
  });
});
