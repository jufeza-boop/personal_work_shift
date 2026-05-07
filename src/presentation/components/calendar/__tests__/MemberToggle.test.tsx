import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SerializedMember } from "@/application/services/calendarUtils";
import { MemberToggle } from "@/presentation/components/calendar/MemberToggle";

const MEMBERS: SerializedMember[] = [
  { userId: "1", displayName: "jufeza", colorPaletteName: "coral" },
  { userId: "2", displayName: "Juan", colorPaletteName: "slate" },
];

describe("MemberToggle", () => {
  it("renders the Miembros heading", () => {
    render(
      <MemberToggle
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /miembros/i }),
    ).toBeInTheDocument();
  });

  it("shows all members by default (expanded)", () => {
    render(
      <MemberToggle
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("jufeza")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("hides the member list when the header is clicked (collapse)", async () => {
    const user = userEvent.setup();
    render(
      <MemberToggle
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
      />,
    );
    const toggle = screen.getByRole("button", { name: /miembros/i });
    await user.click(toggle);
    expect(screen.queryByText("jufeza")).not.toBeInTheDocument();
    expect(screen.queryByText("Juan")).not.toBeInTheDocument();
  });

  it("shows the member list again when the header is clicked twice (expand)", async () => {
    const user = userEvent.setup();
    render(
      <MemberToggle
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={vi.fn()}
      />,
    );
    const toggle = screen.getByRole("button", { name: /miembros/i });
    await user.click(toggle);
    await user.click(toggle);
    expect(screen.getByText("jufeza")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("calls onToggle when a member checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <MemberToggle
        members={MEMBERS}
        hiddenMemberIds={new Set()}
        onToggle={onToggle}
      />,
    );
    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("1");
  });
});
