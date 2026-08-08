"use client";

import type { ProofData } from "@aztec/bb.js";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CheckCircle2, CircleAlert, ExternalLink, Loader2, Send, Wallet } from "lucide-react";
import { useState } from "react";
import { bytesToHex } from "viem";
import { sepolia } from "wagmi/chains";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACTS, PROOF_REGISTRY_ABI, explorerTx } from "@/lib/contracts/verifier";

/**
 * The payoff of the whole ZK Proof Lab: takes a proof already generated
 * client-side and submits it to the deployed `ProofRegistry` on Sepolia as a
 * real, state-changing transaction — requiring a connected wallet and
 * (testnet) gas, rather than a free `view` call.
 *
 * The parent keys this component by proof generation (see proof-lab.tsx), so
 * a fresh proof remounts it — resetting wagmi's write/receipt state and the
 * local error — rather than needing an effect to reset state on prop change.
 */
export function SubmitOnChain({ proof }: { proof: ProofData }) {
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const onWrongChain = isConnected && chainId !== sepolia.id;

  async function handleSubmit() {
    setSubmitError(null);
    try {
      await writeContractAsync({
        address: CONTRACTS.proofRegistry,
        abi: PROOF_REGISTRY_ABI,
        functionName: "submitProof",
        args: [bytesToHex(proof.proof), proof.publicInputs as `0x${string}`[]],
        chainId: sepolia.id,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setSubmitError(message.split("\n")[0]);
    }
  }

  if (receipt) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-success/40 bg-success/10 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" />
          Verified on Sepolia
        </div>
        <a
          href={explorerTx(receipt.transactionHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-data inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View transaction on Etherscan
          <ExternalLink className="size-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {!isConnected ? (
          <button
            type="button"
            onClick={openConnectModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Wallet className="size-4" />
            Connect wallet to submit
          </button>
        ) : onWrongChain ? (
          <button
            type="button"
            onClick={() => switchChain({ chainId: sepolia.id })}
            disabled={isSwitching}
            className="inline-flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/15 disabled:opacity-60"
          >
            {isSwitching ? <Loader2 className="size-4 animate-spin" /> : <CircleAlert className="size-4" />}
            Switch to Sepolia
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || isConfirming}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending || isConfirming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Submitting…" : "Submit on Sepolia"}
          </button>
        )}
        {address && !onWrongChain ? (
          <span className="font-data text-xs text-muted-foreground">
            as {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        ) : null}
      </div>

      {hash && !receipt ? (
        <a
          href={explorerTx(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-data inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {hash.slice(0, 10)}…{hash.slice(-8)}
          <ExternalLink className="size-3" />
        </a>
      ) : null}

      {(submitError || error) && !isPending ? (
        <p className="text-xs text-danger">{submitError || error?.message.split("\n")[0]}</p>
      ) : null}
    </div>
  );
}
