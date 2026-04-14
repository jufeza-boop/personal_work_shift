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
});
