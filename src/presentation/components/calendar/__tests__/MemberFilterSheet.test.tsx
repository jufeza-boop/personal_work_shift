import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SerializedMember } from "@/application/services/calendarUtils";
import { MemberFilterSheet } from "@/presentation/components/calendar/MemberFilterSheet";

const MEMBERS: SerializedMember[] = [
  { userId: "1", displayName: "jufeza", colorPaletteName: "coral" },
  { userId: "2", displayName: "Juan", colorPaletteName: "slate" },
];

describe("MemberFilterSheet", () => {
  it("hides member checkboxes from accessibility tree when closed", () => {
    render(
      <MemberFilterSheet
        isOpen={false}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("shows member checkboxes when open", () => {
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText("jufeza")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("shows the dialog with accessible label when open", () => {
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: /filtrar miembros/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId("member-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Aplicar button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: /aplicar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onToggle with the correct userId when a checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={onToggle}
        onClose={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]!);
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("disables the checkbox for the last visible member", () => {
    render(
      <MemberFilterSheet
        isOpen={true}
        members={MEMBERS}
        hiddenMemberIds={new Set(["2"])}
        onToggle={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Only member "1" (jufeza) is visible; her checkbox must be disabled
    const checkboxes = screen.getAllByRole("checkbox");
    // checkboxes[0] = jufeza (visible, last visible → disabled)
    // checkboxes[1] = Juan (hidden, so its checkbox should NOT be disabled)
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();
  });
});
