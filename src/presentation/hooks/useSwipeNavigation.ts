"use client";

import { useEffect, useRef } from "react";

interface UseSwipeNavigationOptions {
  ref: React.RefObject<HTMLElement | null>;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Minimum horizontal distance in pixels to count as a swipe. Default: 50. */
  threshold?: number;
}

/**
 * Attaches touch-based swipe navigation to the element referenced by `ref`.
 * - Swipe left  → calls `onSwipeLeft`  (navigate to next month)
 * - Swipe right → calls `onSwipeRight` (navigate to previous month)
 * Horizontal touchmove events call `preventDefault()` so the browser does not
 * interpret the gesture as a history back/forward navigation.
 */
export function useSwipeNavigation({
  ref,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseSwipeNavigationOptions): void {
  // Keep latest callbacks in refs so the effect never needs to re-run when
  // the caller passes inline arrow functions.
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
  });
  useEffect(() => {
    onSwipeRightRef.current = onSwipeRight;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0]!.clientX;
      startY = e.touches[0]!.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0]!.clientX - startX;
      const deltaY = e.touches[0]!.clientY - startY;
      // Prevent browser history swipe only when horizontal movement dominates.
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0]!.clientX - startX;
      const deltaY = e.changedTouches[0]!.clientY - startY;

      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      const exceedsThreshold = Math.abs(deltaX) >= threshold;

      if (!isHorizontal || !exceedsThreshold) return;

      if (deltaX < 0) {
        onSwipeLeftRef.current();
      } else {
        onSwipeRightRef.current();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    // passive: false is required so that preventDefault() works on touchmove
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, threshold]);
}
