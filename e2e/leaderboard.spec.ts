import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./utils";

test("home page loads the health leaderboard", async ({ page }) => {
  const tracker = trackPageErrors(page);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "The instrument panel for the Zero-Knowledge ecosystem." }),
  ).toBeVisible();

  const ecosystemLinks = page.locator('a[href^="/ecosystems/"]');
  await expect(ecosystemLinks.first()).toBeVisible();
  expect(await ecosystemLinks.count()).toBeGreaterThanOrEqual(5);

  expect(tracker.errors).toEqual([]);
});
