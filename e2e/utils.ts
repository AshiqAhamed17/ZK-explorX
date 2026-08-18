import type { Page } from "@playwright/test";

/**
 * Collects console errors + uncaught page errors for the lifetime of a test.
 * Assert `tracker.errors` is empty at the end of the test.
 */
export function trackPageErrors(page: Page): { errors: string[] } {
  const tracker = { errors: [] as string[] };
  page.on("pageerror", (err) => tracker.errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") tracker.errors.push(msg.text());
  });
  return tracker;
}
