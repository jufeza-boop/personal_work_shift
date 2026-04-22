import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EditEventForm } from "../EditEventForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("EditEventForm", () => {
  const mockAction = vi.fn().mockResolvedValue({ success: false });
  const baseProps = {
    action: mockAction,
    eventId: "e1",
    redirectTo: "/calendar",
  };

  beforeEach(() => {
    mockAction.mockResolvedValue({ success: false });
  });

  describe("Recurring event - single occurrence scope", () => {
    it("should display the occurrence date field when scope is 'single'", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={{
            title: "Morning shift",
            startDate: "2026-04-01",
            frequencyUnit: "daily" as const,
            frequencyInterval: 1,
            shiftType: "morning",
          }}
        />,
      );

      const radioButton = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      expect(radioButton).toBeInTheDocument();
    });

    it("should pre-fill the occurrence date when provided", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={{
            title: "Morning shift",
            startDate: "2026-04-01",
            frequencyUnit: "daily" as const,
            frequencyInterval: 1,
            shiftType: "morning",
          }}
          occurrenceDate="2026-04-15"
        />,
      );

      // Switch to single occurrence scope
      const singleRadio = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      await user.click(singleRadio);

      // Verify the date field is visible and pre-filled
      const dateInput = screen.getByLabelText(
        /fecha de la ocurrencia/i,
      ) as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();
      expect(dateInput.value).toBe("2026-04-15");
    });

    it("should disable the occurrence date input field", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={{
            title: "Morning shift",
            startDate: "2026-04-01",
            frequencyUnit: "daily" as const,
            frequencyInterval: 1,
            shiftType: "morning",
          }}
          occurrenceDate="2026-04-15"
        />,
      );

      // Switch to single occurrence scope
      const singleRadio = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      await user.click(singleRadio);

      // Verify the date field is disabled
      const dateInput = screen.getByLabelText(
        /fecha de la ocurrencia/i,
      ) as HTMLInputElement;
      expect(dateInput).toBeDisabled();
    });

    it("should show a helpful message about the locked date", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={{
            title: "Morning shift",
            startDate: "2026-04-01",
            frequencyUnit: "daily" as const,
            frequencyInterval: 1,
            shiftType: "morning",
          }}
          occurrenceDate="2026-04-15"
        />,
      );

      // Switch to single occurrence scope
      const singleRadio = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      await user.click(singleRadio);

      // Verify the helper message is shown
      expect(
        screen.getByText(
          /esta fecha no se puede cambiar para evitar modificar otra ocurrencia/i,
        ),
      ).toBeInTheDocument();
    });

    it("should include the occurrence date in form submission via hidden input", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-other"
          defaults={{
            title: "Event",
            startDate: "2026-04-01",
            frequencyUnit: "weekly" as const,
            frequencyInterval: 1,
          }}
          occurrenceDate="2026-04-20"
        />,
      );

      // Switch to single occurrence scope
      const singleRadio = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      await user.click(singleRadio);

      // Find the hidden input
      const hiddenInput = document.querySelector(
        'input[type="hidden"][name="occurrenceDate"]',
      ) as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput.value).toBe("2026-04-20");
    });

    it("should not show occurrence date field when scope is 'all'", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={{
            title: "Morning shift",
            startDate: "2026-04-01",
            frequencyUnit: "daily" as const,
            frequencyInterval: 1,
            shiftType: "morning",
          }}
          occurrenceDate="2026-04-15"
        />,
      );

      // The "all" radio should be selected by default
      const allRadio = screen.getByRole("radio", {
        name: /toda la serie/i,
      });
      expect(allRadio).toBeChecked();

      // The occurrence date label should not be visible
      expect(
        screen.queryByLabelText(/fecha de la ocurrencia/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Recurring event - exceptions warning (scope: all)", () => {
    const recurringWorkDefaults = {
      title: "Morning shift",
      startDate: "2026-04-01",
      frequencyUnit: "daily" as const,
      frequencyInterval: 1,
      shiftType: "morning",
    };

    it("should not show the warning when hasExceptions is false", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={false}
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not show the warning when hasExceptions is true but no sensitive field has changed", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should show the warning when startDate changes and hasExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const startDateInput = screen.getByLabelText(/fecha de inicio/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-05-01");

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(
          /al cambiar la fecha de inicio o la frecuencia se eliminarán todos los cambios puntuales/i,
        ),
      ).toBeInTheDocument();
    });

    it("should show the warning when frequencyUnit changes and hasExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const frequencySelect = screen.getByLabelText(/frecuencia/i);
      await user.selectOptions(frequencySelect, "weekly");

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should show the warning when frequencyInterval changes and hasExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const intervalInput = screen.getByLabelText(/intervalo/i);
      await user.clear(intervalInput);
      await user.type(intervalInput, "2");

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should not show the warning when scope is 'single' even if sensitive fields changed", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
          occurrenceDate="2026-04-15"
        />,
      );

      // Switch to single scope
      const singleRadio = screen.getByRole("radio", {
        name: /esta ocurrencia/i,
      });
      await user.click(singleRadio);

      // No alert should appear in single scope
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should hide the warning if startDate is reverted to its original value", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const startDateInput = screen.getByLabelText(/fecha de inicio/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-05-01");

      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Revert to original value
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-04-01");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Punctual events", () => {
    it("should not show occurrence date fields for punctual events", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="punctual"
          defaults={{
            title: "Doctor visit",
            date: "2026-04-15",
          }}
        />,
      );

      // Scope radios should not be present for punctual events
      expect(
        screen.queryByRole("radio", { name: /esta ocurrencia/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Recurring event - confirmation dialog when deleting exceptions", () => {
    const recurringWorkDefaults = {
      title: "Morning shift",
      startDate: "2026-04-01",
      frequencyUnit: "daily" as const,
      frequencyInterval: 1,
      shiftType: "morning",
    };

    it("should not show the dialog when submitting without exception-breaking changes", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      // Title change only – does not break exceptions
      const titleInput = screen.getByLabelText(/título/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated shift");

      const submitButton = screen.getByRole("button", {
        name: /guardar cambios/i,
      });
      await user.click(submitButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open the confirmation dialog when startDate changed and hasExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const startDateInput = screen.getByLabelText(/fecha de inicio/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-05-01");

      const submitButton = screen.getByRole("button", {
        name: /guardar cambios/i,
      });
      await user.click(submitButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText(/¿Eliminar cambios puntuales\?/i),
      ).toBeInTheDocument();
    });

    it("should close the dialog when the user cancels", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const startDateInput = screen.getByLabelText(/fecha de inicio/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-05-01");

      await user.click(
        screen.getByRole("button", { name: /guardar cambios/i }),
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Find the "Cancelar" button inside the dialog
      const cancelButton = screen
        .getAllByRole("button", { name: /cancelar/i })
        .find((btn) => btn.closest('[role="dialog"]'));
      await user.click(cancelButton!);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open the dialog when frequencyUnit changed and hasExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const frequencySelect = screen.getByLabelText(/frecuencia/i);
      await user.selectOptions(frequencySelect, "weekly");

      await user.click(
        screen.getByRole("button", { name: /guardar cambios/i }),
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should include deleteExceptions hidden input when willLoseExceptions is true", async () => {
      const user = userEvent.setup();

      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const startDateInput = screen.getByLabelText(/fecha de inicio/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, "2026-05-01");

      const hiddenInput = document.querySelector(
        'input[type="hidden"][name="deleteExceptions"]',
      ) as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput.value).toBe("true");
    });

    it("should not include deleteExceptions hidden input when no exception-breaking changes exist", () => {
      render(
        <EditEventForm
          {...baseProps}
          eventType="recurring-work"
          defaults={recurringWorkDefaults}
          hasExceptions={true}
        />,
      );

      const hiddenInput = document.querySelector(
        'input[type="hidden"][name="deleteExceptions"]',
      );
      expect(hiddenInput).not.toBeInTheDocument();
    });
  });
});
