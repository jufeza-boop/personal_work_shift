import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { DayDetailPanel } from "@/presentation/components/calendar/DayDetailPanel";

const MEMBERS: SerializedMember[] = [
  { userId: "u1", displayName: "Alice Smith", colorPaletteName: "sky" },
];

const PUNCTUAL_OCCURRENCE: CalendarOccurrence = {
  eventId: "e1",
  date: "2026-04-10",
  title: "Doctor visit",
  type: "punctual",
  category: null,
  shiftType: null,
  createdBy: "u1",
};

const RECURRING_OCCURRENCE: CalendarOccurrence = {
  eventId: "e2",
  date: "2026-04-10",
  title: "Morning shift",
  type: "recurring",
  category: "work",
  shiftType: "morning",
  createdBy: "u1",
};

describe("DayDetailPanel", () => {
  it("renders the selected date heading", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/abril/i)).toBeInTheDocument();
  });

  it("shows a message when there are no events for the day", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/no hay eventos/i)).toBeInTheDocument();
  });

  it("lists event titles for the selected day", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE, RECURRING_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Doctor visit")).toBeInTheDocument();
    expect(screen.getByText("Morning shift")).toBeInTheDocument();
  });

  it("shows edit and delete buttons for events owned by the current user", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: /editar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /eliminar/i }),
    ).toBeInTheDocument();
  });

  it("does not show edit/delete for events not owned by the current user", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u2"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /editar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /eliminar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a create event button", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /crear evento/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a create form when the create button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /crear evento/i }));

    // The create form should be visible with a title input
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it("shows the event type badge", () => {
    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE, RECURRING_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Puntual")).toBeInTheDocument();
    expect(screen.getByText("Recurrente")).toBeInTheDocument();
  });

  it("opens the delete dialog when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("closes the delete dialog when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByText(/eliminar evento/i)).not.toBeInTheDocument();
  });

  it("shows scope radio options for recurring event delete", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[RECURRING_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    expect(screen.getByText(/toda la serie/i)).toBeInTheDocument();
    expect(screen.getByText(/solo este día/i)).toBeInTheDocument();
  });

  it("toggles delete scope for recurring events", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[RECURRING_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    const singleRadio = screen.getByRole("radio", { name: /solo este día/i });
    await user.click(singleRadio);
    expect(singleRadio).toBeChecked();

    const allRadio = screen.getByRole("radio", { name: /toda la serie/i });
    await user.click(allRadio);
    expect(allRadio).toBeChecked();
  });

  it("shows edit/delete for delegated user events", () => {
    const delegatedOccurrence: CalendarOccurrence = {
      eventId: "e3",
      date: "2026-04-10",
      title: "Kid's event",
      type: "punctual",
      category: null,
      shiftType: null,
      createdBy: "delegated-1",
    };

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[delegatedOccurrence]}
        members={MEMBERS}
        currentUserId="u1"
        delegatedUsers={[{ id: "delegated-1", displayName: "Junior" }]}
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: /editar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /eliminar/i }),
    ).toBeInTheDocument();
  });

  it("hides the no-events message when create form is shown", async () => {
    const user = userEvent.setup();

    render(
      <DayDetailPanel
        date="2026-04-10"
        day={10}
        month={4}
        year={2026}
        occurrences={[]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/no hay eventos/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /crear evento/i }));

    expect(screen.queryByText(/no hay eventos/i)).not.toBeInTheDocument();
  });

  it("includes the date in the edit link URL for recurring events", () => {
    render(
      <DayDetailPanel
        date="2026-04-15"
        day={15}
        month={4}
        year={2026}
        occurrences={[RECURRING_OCCURRENCE]}
        members={MEMBERS}
        currentUserId="u1"
        familyId="f1"
        createAction={vi.fn()}
        deleteAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const editLink = screen.getByRole("link", { name: /editar/i });
    expect(editLink).toHaveAttribute(
      "href",
      "/calendar/events/e2/edit?date=2026-04-15",
    );
  });
});
