import { test as base, expect } from "@playwright/test";

/**
 * Every page mounts the wallet provider tree, which calls out to
 * WalletConnect/Reown's cloud service to validate the project id's origin
 * allowlist. CI builds with a placeholder id (see ci.yml) that isn't a real
 * registered project, so that call 403s — a real, third-party network call
 * these smoke tests have no business depending on either way. Fulfilling it
 * with a benign empty response removes the dependency entirely instead of
 * racing it or filtering error text after the fact.
 */
const WALLETCONNECT_TELEMETRY = /^https:\/\/([a-z0-9-]+\.)?(reown\.com|walletconnect\.(com|org)|web3modal\.org)\//;

interface Fixtures {
  /** Console errors + uncaught page errors seen so far in the test. */
  errorTracker: { errors: string[] };
}

/**
 * Every test using this `test` (instead of importing directly from
 * `@playwright/test`) automatically gets WalletConnect telemetry blocked and
 * console/page errors tracked in `errorTracker` — no per-spec boilerplate,
 * and no new spec can forget to wire it up.
 */
export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.route(WALLETCONNECT_TELEMETRY, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await use(page);
  },

  errorTracker: async ({ page }, use) => {
    const tracker = { errors: [] as string[] };
    page.on("pageerror", (err) => tracker.errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") tracker.errors.push(msg.text());
    });
    await use(tracker);
  },
});

export { expect };
