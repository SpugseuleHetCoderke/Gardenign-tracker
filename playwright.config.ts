import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the real dev server + real Neon database (no mocks). Each
 * spec is responsible for creating whatever species/plants it needs and
 * cleaning them up again, since they share one database.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // shared DB — parallel specs would trip over each other's data
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
