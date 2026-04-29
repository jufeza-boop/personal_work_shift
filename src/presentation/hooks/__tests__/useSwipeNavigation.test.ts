import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSwipeNavigation } from "@/presentation/hooks/useSwipeNavigation";

function createTouch(x: number, y: number): Touch {
  return {
    clientX: x,
    clientY: y,
    identifier: 0,
    target: document.createElement("div"),
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
  } as Touch;
}

function fireTouchStart(el: HTMLElement, x: number, y: number) {
  const touch = createTouch(x, y);
  el.dispatchEvent(
    new TouchEvent("touchstart", {
      bubbles: true,
      touches: [touch],
      changedTouches: [touch],
    }),
  );
}

function fireTouchMove(el: HTMLElement, x: number, y: number) {
  const touch = createTouch(x, y);
  el.dispatchEvent(
    new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [touch],
      changedTouches: [touch],
    }),
  );
}

function fireTouchEnd(el: HTMLElement, x: number, y: number) {
  const touch = createTouch(x, y);
  el.dispatchEvent(
    new TouchEvent("touchend", {
      bubbles: true,
      changedTouches: [touch],
    }),
  );
}

describe("useSwipeNavigation", () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
    vi.restoreAllMocks();
  });

  it("calls onSwipeLeft when swiping left beyond threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 300, 100);
    fireTouchEnd(el, 200, 105); // deltaX = -100, |deltaX| > |deltaY|

    expect(onSwipeLeft).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight when swiping right beyond threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 200, 100);
    fireTouchEnd(el, 350, 105); // deltaX = +150, |deltaX| > |deltaY|

    expect(onSwipeRight).toHaveBeenCalledOnce();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does not trigger when horizontal movement is below threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 200, 100);
    fireTouchEnd(el, 230, 100); // deltaX = 30, below default 50px threshold

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("does not trigger when vertical movement dominates", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 200, 100);
    fireTouchEnd(el, 140, 250); // |deltaX|=60, |deltaY|=150 → vertical dominates

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("respects a custom threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };

    renderHook(() =>
      useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight, threshold: 100 }),
    );

    // 80px swipe — above default 50 but below custom 100
    fireTouchStart(el, 300, 100);
    fireTouchEnd(el, 220, 102);

    expect(onSwipeLeft).not.toHaveBeenCalled();

    // 120px swipe — above custom 100
    fireTouchStart(el, 300, 100);
    fireTouchEnd(el, 180, 102);

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  it("prevents default on horizontal touchmove to block browser navigation", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };
    const preventDefaultSpy = vi.fn();

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 300, 100);

    // Create a touchmove event manually so we can spy on preventDefault
    const touch = createTouch(200, 103);
    const moveEvent = new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [touch],
      changedTouches: [touch],
    });
    Object.defineProperty(moveEvent, "preventDefault", {
      value: preventDefaultSpy,
      writable: false,
    });
    el.dispatchEvent(moveEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("does not prevent default on vertical touchmove", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };
    const preventDefaultSpy = vi.fn();

    renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }));

    fireTouchStart(el, 200, 100);

    // Vertical-dominant move
    const touch = createTouch(205, 200);
    const moveEvent = new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [touch],
      changedTouches: [touch],
    });
    Object.defineProperty(moveEvent, "preventDefault", {
      value: preventDefaultSpy,
      writable: false,
    });
    el.dispatchEvent(moveEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("cleans up event listeners when unmounted", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");

    const { unmount } = renderHook(() =>
      useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight }),
    );

    expect(addSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      expect.anything(),
    );
    expect(addSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function),
      expect.anything(),
    );
    expect(addSpy).toHaveBeenCalledWith(
      "touchend",
      expect.any(Function),
      expect.anything(),
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchmove", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchend", expect.any(Function));
  });

  it("does nothing when ref.current is null", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const ref = { current: null } as React.RefObject<HTMLDivElement>;

    expect(() =>
      renderHook(() => useSwipeNavigation({ ref, onSwipeLeft, onSwipeRight })),
    ).not.toThrow();
  });
});
