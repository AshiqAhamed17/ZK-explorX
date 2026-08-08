/**
 * Empty stub for the `@x402/*` payment SDK packages, which are not installed
 * (and never needed). RainbowKit's shipped bundle unconditionally imports the
 * `baseAccount` wallet connector as part of its module graph — regardless of
 * which wallets an app actually selects — and that connector's dependency
 * chain (@base-org/account -> @coinbase/cdp-sdk) imports `@x402/*` for a
 * Coinbase payment feature this app never uses (the curated wallet list in
 * `src/lib/wagmi/config.ts` doesn't include `baseAccount`, so this code path
 * is never actually executed at runtime).
 *
 * Written as CommonJS + a Proxy, rather than an ES module with static named
 * exports, specifically so it satisfies *any* named import the various
 * `@x402/*` subpaths use — ESM export lists are statically checked by
 * Turbopack, so a real empty ESM module fails with "export X doesn't exist"
 * for each import; a CJS Proxy sidesteps that by resolving any property
 * access to a harmless no-op function at runtime.
 *
 * Aliased in next.config.ts (turbopack.resolveAlias).
 */
module.exports = new Proxy(
  {},
  {
    get() {
      return () => undefined;
    },
  },
);
