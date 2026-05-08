import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "AUTH_DRIVER=mock npm run dev -- --hostname localhost --port 3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3000",
  },
  projects: [
    {
      name: "edge",
      use: {
        ...devices["Desktop Edge"],
      },
    },
  ],
});
