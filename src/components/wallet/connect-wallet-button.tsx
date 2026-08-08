"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, ChevronDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A fully custom wallet-connect control built on RainbowKit's render-prop API
 * (`ConnectButton.Custom`) so it matches this app's own button/pill styling
 * exactly, rather than RainbowKit's own chrome (even themed).
 *
 * The `mounted` guard is RainbowKit's documented pattern for avoiding a
 * hydration flash — this button reflects wallet state, which only exists
 * client-side, so it renders nothing until mounted.
 */
export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) {
          return <div className="h-8 w-[104px]" aria-hidden />;
        }

        if (!account || !chain) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Wallet className="size-3.5" />
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/15"
            >
              <AlertTriangle className="size-3.5" />
              Wrong network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary",
              "font-data",
            )}
          >
            <span className="size-2 rounded-full bg-success" aria-hidden />
            {account.displayName}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
