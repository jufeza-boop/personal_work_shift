import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the hook so the component tests focus only on rendering logic
vi.mock("@/presentation/hooks/usePushNotifications", () => ({
  usePushNotifications: vi.fn(),
}));

import { usePushNotifications } from "@/presentation/hooks/usePushNotifications";
import { NotificationOptIn } from "@/presentation/components/ui/NotificationOptIn";

const mockHook = vi.mocked(usePushNotifications);

const baseHookResult = {
  isLoading: false,
  isSubscribed: false,
  isSupported: true,
  permission: "default" as const,
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHook.mockReturnValue(baseHookResult);
});

describe("NotificationOptIn", () => {
  it("renders the subscribe prompt when not subscribed and permission is default", () => {
    render(<NotificationOptIn />);

    expect(
      screen.getByText(/Activa las notificaciones para recibir avisos/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Activar/i }),
    ).toBeInTheDocument();
  });

  it("renders the active state when already subscribed", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isSubscribed: true });

    render(<NotificationOptIn />);

    expect(screen.getByText(/Notificaciones activas/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Desactivar/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when browser does not support push", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isSupported: false });

    const { container } = render(<NotificationOptIn />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when permission is denied", () => {
    mockHook.mockReturnValue({
      ...baseHookResult,
      permission: "denied" as const,
    });

    const { container } = render(<NotificationOptIn />);

    expect(container.firstChild).toBeNull();
  });

  it("disables the button while loading", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isLoading: true });

    render(<NotificationOptIn />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
