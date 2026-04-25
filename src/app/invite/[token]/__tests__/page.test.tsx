import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import InvitePage from "@/app/invite/[token]/page";

const mockGetAuthenticatedUser = vi.fn();
const mockFindByToken = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/infrastructure/auth/runtime", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

vi.mock("@/infrastructure/invitation/runtime", () => ({
  createServerInvitationDependencies: async () => ({
    familyRepository: {
      findById: vi.fn(),
    },
    invitationRepository: {
      findByToken: mockFindByToken,
    },
    userRepository: {},
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

describe("InvitePage", () => {
  beforeEach(() => {
    mockGetAuthenticatedUser.mockReset();
    mockFindByToken.mockReset();
    mockRedirect.mockReset();
  });

  it("shows login/register guidance when no user is authenticated", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);
    mockFindByToken.mockResolvedValue({
      computeCurrentStatus: () => "active",
      expiresAt: new Date("2026-05-02T00:00:00.000Z"),
      familyId: "family-1",
      familyName: "Casa",
    });

    render(await InvitePage({ params: Promise.resolve({ token: "tok-123" }) }));

    expect(
      screen.getByRole("heading", { name: /inicia sesión o regístrate/i }),
    ).toBeInTheDocument();

    const loginLink = screen.getByRole("link", {
      name: /iniciar sesión/i,
    });
    expect(loginLink).toHaveAttribute(
      "href",
      "/login?redirectTo=%2Finvite%2Ftok-123",
    );

    const registerLink = screen.getByRole("link", {
      name: /registrarte/i,
    });
    expect(registerLink).toHaveAttribute(
      "href",
      "/register?redirectTo=%2Finvite%2Ftok-123",
    );

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
