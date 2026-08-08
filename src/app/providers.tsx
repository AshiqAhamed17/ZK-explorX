"use client";

import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/config";

/**
 * Client-side wallet boundary: Wagmi + React Query + RainbowKit.
 *
 * No server-side cookie reading here on purpose. `ssr: true` on `wagmiConfig`
 * already defers wagmi's store hydration into a `useEffect` (see wagmi's
 * `Hydrate` component), which is what actually prevents an SSR/client
 * mismatch — regardless of whether an `initialState` is supplied. Threading
 * a cookie-derived `initialState` through the root layout is a pure
 * optimization (it avoids a brief "disconnected" flash on reload for a
 * previously-connected wallet), but doing so requires the root layout to call
 * `headers()`, which makes every page in the app dynamic — killing the ISR
 * caching this app's GitHub/DefiLlama data fetching depends on to stay
 * within API rate limits. Not worth it for a demo wallet-connect flow, so
 * this app accepts the brief flash instead.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { resolvedTheme } = useTheme();

  const rainbowKitTheme =
    resolvedTheme === "light"
      ? lightTheme({ accentColor: "#5b3df5", borderRadius: "medium" })
      : darkTheme({ accentColor: "#7c6cff", borderRadius: "medium" });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
