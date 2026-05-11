import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom (used by input-otp)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
