import { expect, test } from "./utils";

test("the compare tool renders a default comparison", async ({ page, errorTracker }) => {
  // No ?ids= — CompareTool defaults to the top-2-ranked ecosystems.
  await page.goto("/compare");

  await expect(page.getByRole("heading", { name: "Compare ecosystems" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Health score", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Adoption", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Contributors", exact: true })).toBeVisible();

  expect(errorTracker.errors).toEqual([]);
});
