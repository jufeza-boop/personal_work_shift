import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type {
  SerializedEvent,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { CalendarGrid } from "@/presentation/components/calendar/CalendarGrid";

const MEMBERS: SerializedMember[] = [
  { userId: "u1", displayName: "Alice Smith", colorPaletteName: "sky" },
  { userId: "u2", displayName: "Bob Jones", colorPaletteName: "rose" },
];

const EVENTS: SerializedEvent[] = [
  {
    type: "punctual",
    id: "e1",
    familyId: "f1",
    createdBy: "u1",
    title: "Doctor visit",
    date: "2026-04-10",
    startTime: null,
    endTime: null,
  },
  {
    type: "recurring",
    id: "e2",
    familyId: "f1",
    createdBy: "u2",
    title: "Morning shift",
    category: "work",
    startDate: "2026-04-06",
    endDate: null,
    frequencyUnit: "weekly",
    frequencyInterval: 1,
    shiftType: "morning",
  },
  {
    type: "recurring",
    id: "e3",
    familyId: "f1",
    createdBy: "u1",
    title: "Weekly yoga",
    category: "other",
    startDate: "2026-04-01",
    endDate: null,
    frequencyUnit: "weekly",
    frequencyInterval: 1,
    shiftType: null,
  },
];

describe("CalendarGrid", () => {
  it("renders the month name and year", () => {
    render(
      <CalendarGrid
        events={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    expect(screen.getByText("Abril 2026")).toBeInTheDocument();
  });

  it("renders day-of-week headers in Spanish", () => {
    render(
      <CalendarGrid
        events={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
  });

  it("renders the correct number of day cells for the month", () => {
    render(
      <CalendarGrid
        events={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    // April has 30 days; day numbers 1-30 should be present
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.queryByText("31")).not.toBeInTheDocument();
  });

  it("navigates to the next month when clicking the next button", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        events={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));

    expect(screen.getByText("Mayo 2026")).toBeInTheDocument();
  });

  it("navigates to the previous month when clicking the back button", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        events={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mes anterior" }));

    expect(screen.getByText("Marzo 2026")).toBeInTheDocument();
  });

  it("renders member toggle checkboxes for each member", () => {
    render(
      <CalendarGrid
        events={[]}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("shows punctual event title as a text label in the correct day cell", () => {
    render(
      <CalendarGrid
        events={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    expect(screen.getByText("Doctor visit")).toBeInTheDocument();
  });

  it("shows recurring other event title as a text label", () => {
    render(
      <CalendarGrid
        events={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    // Weekly yoga starts 2026-04-01, so it appears on Wednesdays in April
    const labels = screen.getAllByText("Weekly yoga");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("hides events for a toggled-off member", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        events={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    // Doctor visit belongs to u1 (Alice). Toggle off Alice.
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is Alice
    await user.click(checkboxes[0]!);

    expect(screen.queryByText("Doctor visit")).not.toBeInTheDocument();
  });

  it("disables the checkbox for the last visible member", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        events={[]}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // Hide Bob first (second checkbox)
    await user.click(checkboxes[1]!);

    // Now Alice is the last visible; her checkbox should be disabled
    const aliceCheckbox = screen.getAllByRole("checkbox")[0];
    expect(aliceCheckbox).toBeDisabled();
  });

  it("handles an empty members list without crashing", () => {
    expect(() =>
      render(
        <CalendarGrid
          events={[]}
          members={[]}
          initialYear={2026}
          initialMonth={4}
        />,
      ),
    ).not.toThrow();
  });
});
