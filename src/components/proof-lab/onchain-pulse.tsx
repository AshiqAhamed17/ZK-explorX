"use client";

import { ExternalLink, Radio } from "lucide-react";
import { sepolia } from "wagmi/chains";
import { useBlockNumber, useReadContract } from "wagmi";
import { CONTRACTS, PROOF_REGISTRY_ABI, explorerAddress } from "@/lib/contracts/verifier";
import { formatNumber } from "@/lib/utils";

/**
 * A small, always-visible read-only widget — no wallet connection required.
 * Demonstrates contract reads outside the prove/submit flow: the live
 * Sepolia block number (via a public RPC, polled by wagmi) and how many
 * proofs the deployed ProofRegistry has verified so far across all users.
 */
export function OnchainPulse() {
  const { data: blockNumber } = useBlockNumber({ chainId: sepolia.id, watch: true });
  const { data: totalProofs } = useReadContract({
    address: CONTRACTS.proofRegistry,
    abi: PROOF_REGISTRY_ABI,
    functionName: "totalProofs",
    chainId: sepolia.id,
  });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Radio className="size-3.5 text-success" />
        Live on Sepolia
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-data text-sm font-semibold">
          {blockNumber !== undefined ? formatNumber(Number(blockNumber)) : "—"}
        </span>
        <span className="text-xs text-muted-foreground">latest block</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-data text-sm font-semibold">
          {totalProofs !== undefined ? formatNumber(Number(totalProofs)) : "—"}
        </span>
        <span className="text-xs text-muted-foreground">proofs verified on-chain</span>
      </div>
      <a
        href={explorerAddress(CONTRACTS.proofRegistry)}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ProofRegistry
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
