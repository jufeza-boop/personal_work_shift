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
      screen.getByRole("button", { name: "Recurrente" }),
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

  it("shows recurring fields and category when switching to recurrente tab", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Recurrente" }));

    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frecuencia/i)).toBeInTheDocument();
  });

  it("shows shift type when work category is selected", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Recurrente" }));

    const categorySelect = screen.getByLabelText(/categoría/i);
    await user.selectOptions(categorySelect, "work");

    expect(screen.getByLabelText(/tipo de turno/i)).toBeInTheDocument();
  });

  it("shows frequency and interval fields in recurring tab", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-04-10"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Recurrente" }));

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

  it("sets min on endDate equal to the selected date for recurring tab", async () => {
    const user = userEvent.setup();

    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-10-05"
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Recurrente" }));

    const endDateInput = screen.getByLabelText(
      /fecha de fin/i,
    ) as HTMLInputElement;
    expect(endDateInput).toHaveAttribute("min", "2026-10-05");
  });

  it("uses provided redirectTo prop in the form hidden input", () => {
    render(
      <DayCreateEventForm
        action={vi.fn()}
        familyId="f1"
        date="2026-10-05"
        redirectTo="/calendar?year=2026&month=10"
        onCancel={vi.fn()}
      />,
    );

    const redirectInput = document.querySelector(
      'input[type="hidden"][name="redirectTo"]',
    ) as HTMLInputElement;
    expect(redirectInput).toBeInTheDocument();
    expect(redirectInput.value).toBe("/calendar?year=2026&month=10");
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

