import { defineConfig, devices } from "@playwright/test";

/**
 * e2e smoke tests — highest-value flows only (leaderboard, an ecosystem
 * page, compare, the Proof Lab shell). Runs against a production build
 * (`npm run build && npm run start`), not `next dev`, so it exercises what
 * actually ships. `webServer` assumes a build already exists (CI runs
 * `npm run build` as its own step first) and just starts the server; for a
 * standalone local run, `npm run build` first.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
