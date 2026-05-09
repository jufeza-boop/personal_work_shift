import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  CalendarOccurrence,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { DayCell } from "@/presentation/components/calendar/DayCell";

const MEMBERS: SerializedMember[] = [
  { userId: "u1", displayName: "Alice Smith", colorPaletteName: "sky" },
  { userId: "u2", displayName: "Bob Jones", colorPaletteName: "rose" },
];

const PUNCTUAL_OCCURRENCE: CalendarOccurrence = {
  eventId: "e1",
  date: "2026-04-10",
  title: "Doctor visit",
  type: "punctual",
  category: null,
  shiftType: null,
  createdBy: "u1",
  description: null,
  startTime: null,
  endTime: null,
};

const SHIFT_OCCURRENCE: CalendarOccurrence = {
  eventId: "e2",
  date: "2026-04-10",
  title: "Morning shift",
  type: "recurring",
  category: "work",
  shiftType: "morning",
  createdBy: "u1",
  description: null,
  startTime: null,
  endTime: null,
};

const SHIFT_OCCURRENCE_2: CalendarOccurrence = {
  eventId: "e3",
  date: "2026-04-10",
  title: "Night shift",
  type: "recurring",
  category: "work",
  shiftType: "night",
  createdBy: "u2",
  description: null,
  startTime: null,
  endTime: null,
};

const VACATION_OCCURRENCE: CalendarOccurrence = {
  eventId: "e4",
  date: "2026-04-10",
  title: "Summer vacation",
  type: "recurring",
  category: "vacations",
  shiftType: null,
  createdBy: "u1",
  description: null,
  startTime: null,
  endTime: null,
};

describe("DayCell", () => {
  it("calls onSelect with the date string when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /10/ }));
    expect(onSelect).toHaveBeenCalledWith("2026-04-10");
  });

  it("renders the day number", () => {
    render(
      <DayCell
        day={15}
        dateStr="2026-04-15"
        isToday={false}
        occurrences={[]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("applies today styling when isToday is true", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={true}
        occurrences={[]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /10/ });
    expect(button.className).toContain("bg-blue-50");
  });

  it("applies selected ring styling when isSelected is true", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        isSelected={true}
        occurrences={[]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /10/ });
    expect(button.className).toContain("ring-2");
    expect(button.className).toContain("ring-blue-500");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("does not apply selected ring styling when isSelected is false", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        isSelected={false}
        occurrences={[]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /10/ });
    expect(button.className).not.toContain("ring-blue-500");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("renders punctual event labels", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Doctor visit")).toBeInTheDocument();
  });

  it("applies the member palette base color as background for punctual events", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    // Alice has "sky" palette; getBaseColor uses the afternoon tone as base (#7DD3FC)
    const label = screen.getByText("Doctor visit");
    expect(label).toHaveStyle({ backgroundColor: "#7DD3FC" });
  });

  it("shows the event title (not member initials) for work/study shift events", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[SHIFT_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Morning shift")).toBeInTheDocument();
    // Should NOT show member initials
    expect(screen.queryByText("AS")).not.toBeInTheDocument();
  });

  it("fills the entire day cell background with the shift palette color for a single work/study event", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[SHIFT_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    // sky/morning = #E0F2FE
    const button = screen.getByRole("button", { name: /10/ });
    expect(button).toHaveStyle({ backgroundColor: "#E0F2FE" });
  });

  it("uses a diagonal gradient background for two simultaneous work/study events", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[SHIFT_OCCURRENCE, SHIFT_OCCURRENCE_2]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    // sky/morning = #E0F2FE, rose/night = #E11D48
    const button = screen.getByRole("button", { name: /10/ });
    expect(button).toHaveStyle({
      background: "linear-gradient(135deg, #E0F2FE 50%, #E11D48 50%)",
    });
  });

  it("uses text-slate-900 for shift event labels to meet WCAG AA contrast", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[SHIFT_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    const label = screen.getByText("Morning shift");
    expect(label.className).toContain("text-slate-900");
  });

  it("uses text-slate-900 for punctual event labels to meet WCAG AA contrast", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[PUNCTUAL_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    const label = screen.getByText("Doctor visit");
    expect(label.className).toContain("text-slate-900");
  });

  it("fills the day cell background with a diagonal stripe for vacation events", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[VACATION_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    // sky/morning (lightest tone) = #E0F2FE
    const button = screen.getByRole("button", { name: /10/ });
    expect(button).toHaveStyle({
      background:
        "repeating-linear-gradient(45deg, #E0F2FE 0px, #E0F2FE 6px, #ffffff 6px, #ffffff 12px)",
    });
  });

  it("renders the vacation event title inside the cell", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[VACATION_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Summer vacation")).toBeInTheDocument();
  });

  it("shows a striped pill label for vacation when a shift event also fills the cell", () => {
    render(
      <DayCell
        day={10}
        dateStr="2026-04-10"
        isToday={false}
        occurrences={[SHIFT_OCCURRENCE, VACATION_OCCURRENCE]}
        members={MEMBERS}
        onSelect={vi.fn()}
      />,
    );

    // The shift event should dominate the cell background (sky/morning = #E0F2FE)
    const button = screen.getByRole("button", { name: /10/ });
    expect(button).toHaveStyle({ backgroundColor: "#E0F2FE" });

    // Vacation title should still appear as a striped label
    const label = screen.getByText("Summer vacation");
    expect(label).toBeInTheDocument();
    expect(label).toHaveStyle({
      background:
        "repeating-linear-gradient(45deg, #E0F2FE 0px, #E0F2FE 6px, #ffffff 6px, #ffffff 12px)",
    });
  });
});
