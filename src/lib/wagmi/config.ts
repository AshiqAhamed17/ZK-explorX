import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { cookieStorage, createStorage, http } from "wagmi";
import { sepolia } from "wagmi/chains";

/**
 * The app only ever talks to Sepolia — that's where the ZK Proof Lab's
 * contracts (`src/lib/contracts/verifier.ts`) are deployed.
 *
 * `ssr: true` + cookie storage is required to avoid an SSR/client hydration
 * mismatch with the App Router (see `src/app/providers.tsx` +
 * `src/app/layout.tsx`, which reads the cookie header and passes
 * `cookieToInitialState` down).
 *
 * A curated `wallets` list is passed explicitly rather than relying on
 * RainbowKit's default set: its default list now includes `baseAccount`
 * (Coinbase's newer "Base Account" connector), which transitively pulls in
 * `@base-org/account`'s Solana/x402-payment SDK — code that doesn't bundle
 * under Turbopack and that this app has no use for. The classic
 * `coinbaseWallet` connector below covers Coinbase Wallet without that.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "ZK-explorX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, walletConnectWallet, injectedWallet],
    },
  ],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});
