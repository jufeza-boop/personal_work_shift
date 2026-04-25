import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvitationList } from "@/presentation/components/family/InvitationList";

const mockCancelAction = vi.fn().mockResolvedValue({ success: false });

const BASE_ACTIVE = {
  createdAt: "2026-04-25T10:00:00Z",
  expiresAt: "2099-12-31T23:59:59Z",
  familyName: "Los García",
  id: "inv-1",
  status: "active" as const,
  token: "tok-abc",
  usedAt: null,
  usedBy: null,
};

const BASE_USED = {
  createdAt: "2026-01-01T10:00:00Z",
  expiresAt: "2026-01-08T10:00:00Z",
  familyName: "Los García",
  id: "inv-2",
  status: "used" as const,
  token: "tok-def",
  usedAt: "2026-01-05T12:00:00Z",
  usedBy: "user-2",
};

describe("InvitationList", () => {
  it("renders empty state message when no invitations", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(screen.getByText(/no hay invitaciones/i)).toBeInTheDocument();
  });

  it("renders an active invitation with its status badge", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_ACTIVE]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(screen.getByText("Activa")).toBeInTheDocument();
  });

  it("renders a used invitation with its status badge", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_USED]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(screen.getByText("Usada")).toBeInTheDocument();
  });

  it("renders a cancelled invitation with its status badge", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[
          {
            ...BASE_ACTIVE,
            expiresAt: "2099-12-31T23:59:59Z",
            id: "inv-3",
            status: "cancelled",
            token: "tok-ghi",
          },
        ]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("shows cancel button for active invitations", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_ACTIVE]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("does not show cancel button for non-active invitations", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_USED]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /cancelar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the invitation URL for active invitations", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_ACTIVE]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(
      screen.getByText("http://localhost:3000/invite/tok-abc"),
    ).toBeInTheDocument();
  });

  it("shows used-at date for used invitations", () => {
    render(
      <InvitationList
        cancelAction={mockCancelAction}
        familyId="f1"
        invitations={[BASE_USED]}
        siteUrl="http://localhost:3000"
      />,
    );

    expect(screen.getByText(/usada el/i)).toBeInTheDocument();
  });
});
