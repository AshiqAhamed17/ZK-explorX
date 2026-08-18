import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./utils";

test("an ecosystem page opens from the leaderboard and renders real data", async ({ page }) => {
  const tracker = trackPageErrors(page);

  await page.goto("/");
  const firstEcosystemLink = page.locator('a[href^="/ecosystems/"]').first();
  const href = await firstEcosystemLink.getAttribute("href");
  await firstEcosystemLink.click();
  await page.waitForURL(`**${href}`);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Proof System")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Developer Health" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Health breakdown" })).toBeVisible();

  expect(tracker.errors).toEqual([]);
});
