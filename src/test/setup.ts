import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom (used by input-otp)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
