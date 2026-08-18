import { expect, test } from "./utils";

/**
 * Smoke-tests the page shell only. Actually clicking "Generate proof" runs a
 * real Noir/UltraHonk proving pipeline as WebAssembly in a Web Worker —
 * correct, but slow and heavy, and deliberately out of scope for a CI smoke
 * test (see TASKS.md 7.2).
 */
test("the Proof Lab page loads its form without generating a proof", async ({
  page,
  errorTracker,
}) => {
  await page.goto("/proof-lab");

  await expect(page.getByRole("heading", { name: "ZK Proof Lab" })).toBeVisible();
  await expect(page.getByRole("button", { name: /generate proof/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /generate proof/i })).toBeEnabled();

  expect(errorTracker.errors).toEqual([]);
});
