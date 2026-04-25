import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/presentation/hooks/usePushNotifications", () => ({
  usePushNotifications: vi.fn(),
}));

import { usePushNotifications } from "@/presentation/hooks/usePushNotifications";
import { NotificationBell } from "@/presentation/components/ui/NotificationBell";

const mockHook = vi.mocked(usePushNotifications);

const baseHookResult = {
  isLoading: false,
  isSubscribed: false,
  isSupported: true,
  permission: "default" as const,
  subscribe: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockHook.mockReturnValue({ ...baseHookResult });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("NotificationBell", () => {
  it("renders a BellOff button when not subscribed", () => {
    render(<NotificationBell />);

    const button = screen.getByRole("button", {
      name: /Activar notificaciones/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("renders a Bell button when subscribed", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isSubscribed: true });

    render(<NotificationBell />);

    const button = screen.getByRole("button", {
      name: /Desactivar notificaciones/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("renders nothing when browser does not support push", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isSupported: false });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when permission is denied", () => {
    mockHook.mockReturnValue({
      ...baseHookResult,
      permission: "denied" as const,
    });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it("calls subscribe and shows 'Notificaciones activas' when not subscribed and clicked", async () => {
    render(<NotificationBell />);

    fireEvent.click(
      screen.getByRole("button", { name: /Activar notificaciones/i }),
    );

    const status = await screen.findByRole("status");
    expect(baseHookResult.subscribe).toHaveBeenCalledOnce();
    expect(status).toHaveTextContent("Notificaciones activas");
  });

  it("calls unsubscribe and shows 'Notificaciones inactivas' when subscribed and clicked", async () => {
    mockHook.mockReturnValue({ ...baseHookResult, isSubscribed: true });

    render(<NotificationBell />);

    fireEvent.click(
      screen.getByRole("button", { name: /Desactivar notificaciones/i }),
    );

    const status = await screen.findByRole("status");
    expect(baseHookResult.unsubscribe).toHaveBeenCalledOnce();
    expect(status).toHaveTextContent("Notificaciones inactivas");
  });

  it("dismisses the status message after 3 seconds", async () => {
    vi.useFakeTimers();

    render(<NotificationBell />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Activar notificaciones/i }),
      );
      // Flush the resolved mock promise so setStatusMessage runs
      await Promise.resolve();
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Notificaciones activas",
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("disables the button while loading", () => {
    mockHook.mockReturnValue({ ...baseHookResult, isLoading: true });

    render(<NotificationBell />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
