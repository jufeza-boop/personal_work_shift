import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePushNotifications } from "@/presentation/hooks/usePushNotifications";

const mockGetSubscription = vi.fn();
const mockSubscribe = vi.fn();
const mockFetch = vi.fn();
const mockRequestPermission = vi.fn();

const mockPushManager = {
  getSubscription: mockGetSubscription,
  subscribe: mockSubscribe,
};

const mockRegistration = {
  pushManager: mockPushManager,
};

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);

  // Stub Notification global
  vi.stubGlobal("Notification", {
    permission: "default",
    requestPermission: mockRequestPermission,
  });

  // Add PushManager to window without replacing the whole window
  Object.defineProperty(window, "PushManager", {
    value: class {},
    configurable: true,
    writable: true,
  });

  // Stub navigator.serviceWorker
  Object.defineProperty(navigator, "serviceWorker", {
    value: {
      ready: Promise.resolve(mockRegistration),
    },
    configurable: true,
    writable: true,
  });

  mockGetSubscription.mockResolvedValue(null);
  mockRequestPermission.mockResolvedValue("default");
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("usePushNotifications", () => {
  it("reports isSubscribed=false when no existing subscription", async () => {
    mockGetSubscription.mockResolvedValue(null);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isSubscribed).toBe(false);
  });

  it("reports isSubscribed=true when an existing subscription is found", async () => {
    mockGetSubscription.mockResolvedValue({
      endpoint: "https://push.example.com/sub/1",
    });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.isSubscribed).toBe(true);
  });

  it("calls subscribe flow and sets isSubscribed=true on success", async () => {
    mockRequestPermission.mockResolvedValue("granted");
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ vapidPublicKey: "dGVzdA" }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const fakeSubscription = {
      endpoint: "https://push.example.com/sub/1",
      toJSON: () => ({
        endpoint: "https://push.example.com/sub/1",
        keys: { auth: "auth-key", p256dh: "p256dh-key" },
      }),
    };
    mockSubscribe.mockResolvedValue(fakeSubscription);

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.permission).toBe("granted");
  });

  it("does not subscribe when permission is denied", async () => {
    mockRequestPermission.mockResolvedValue("denied");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vapidPublicKey: "dGVzdA" }),
    });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it("calls unsubscribe flow and sets isSubscribed=false", async () => {
    const mockUnsubFn = vi.fn().mockResolvedValue(true);
    const fakeSubscription = {
      endpoint: "https://push.example.com/sub/1",
      unsubscribe: mockUnsubFn,
    };
    mockGetSubscription
      .mockResolvedValueOnce(fakeSubscription) // initial check
      .mockResolvedValueOnce(fakeSubscription); // during unsubscribe
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(mockUnsubFn).toHaveBeenCalled();
  });
});
