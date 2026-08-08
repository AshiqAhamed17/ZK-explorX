import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // RainbowKit's shipped bundle unconditionally imports the `baseAccount`
      // wallet connector (regardless of which wallets an app selects), which
      // pulls in @coinbase/cdp-sdk's x402 payment feature — code this app
      // never uses (the curated wallet list in src/lib/wagmi/config.ts
      // excludes `baseAccount`) and whose @x402/* packages aren't installed.
      // Every @x402/* import reachable from that chain is enumerated here
      // (verified via `grep -r "@x402/" node_modules/@coinbase/cdp-sdk
      // node_modules/@base-org/account node_modules/@wagmi/connectors`) and
      // aliased to an empty stub. See src/stubs/x402-empty.js.
      "@x402/core/client": "./src/stubs/x402-empty.js",
      "@x402/core/server": "./src/stubs/x402-empty.js",
      "@x402/core/types": "./src/stubs/x402-empty.js",
      "@x402/evm": "./src/stubs/x402-empty.js",
      "@x402/evm/batch-settlement/client": "./src/stubs/x402-empty.js",
      "@x402/evm/exact/client": "./src/stubs/x402-empty.js",
      "@x402/evm/exact/server": "./src/stubs/x402-empty.js",
      "@x402/evm/exact/v1/client": "./src/stubs/x402-empty.js",
      "@x402/evm/upto/client": "./src/stubs/x402-empty.js",
      "@x402/evm/upto/server": "./src/stubs/x402-empty.js",
      "@x402/express": "./src/stubs/x402-empty.js",
      "@x402/extensions/bazaar": "./src/stubs/x402-empty.js",
      "@x402/extensions/builder-code": "./src/stubs/x402-empty.js",
      "@x402/fetch": "./src/stubs/x402-empty.js",
      "@x402/svm/exact/client": "./src/stubs/x402-empty.js",
      "@x402/svm/exact/server": "./src/stubs/x402-empty.js",
      "@x402/svm/exact/v1/client": "./src/stubs/x402-empty.js",
    },
  },
};

export default nextConfig;
