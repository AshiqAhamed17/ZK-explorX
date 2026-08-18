import { expect, test } from "./utils";

test("home page loads the health leaderboard", async ({ page, errorTracker }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "The instrument panel for the Zero-Knowledge ecosystem." }),
  ).toBeVisible();

  const ecosystemLinks = page.locator('a[href^="/ecosystems/"]');
  await expect(ecosystemLinks.first()).toBeVisible();
  expect(await ecosystemLinks.count()).toBeGreaterThanOrEqual(5);

  expect(errorTracker.errors).toEqual([]);
});
