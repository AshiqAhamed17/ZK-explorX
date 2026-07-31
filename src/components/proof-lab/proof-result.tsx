"use client";

import type { ProofData } from "@aztec/bb.js";
import { useState } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VerifyState = "idle" | "verifying" | "valid" | "invalid";

function bytesToHex(bytes: Uint8Array): string {
  let out = "0x";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function truncateMiddle(hex: string, head = 34, tail = 8): string {
  if (hex.length <= head + tail + 3) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export function ProofResult({
  proof,
  publicRange,
  verifyState,
  onVerify,
}: {
  proof: ProofData;
  publicRange: { min: number; max: number };
  verifyState: VerifyState;
  onVerify: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const hex = bytesToHex(proof.proof);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-success" />
        <span className="text-sm font-medium">Proof generated</span>
        <Badge variant="success" className="ml-auto">
          UltraHonk
        </Badge>
      </div>

      {/* Public inputs — what a verifier sees */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Public inputs · visible to any verifier
        </div>
        <div className="mt-2 flex gap-6">
          <div>
            <div className="font-data text-lg font-semibold">{publicRange.min}</div>
            <div className="text-xs text-muted-foreground">min</div>
          </div>
          <div>
            <div className="font-data text-lg font-semibold">{publicRange.max}</div>
            <div className="text-xs text-muted-foreground">max</div>
          </div>
          <div className="ml-auto self-center text-right text-xs text-muted-foreground">
            {`${proof.publicInputs.length} field element${proof.publicInputs.length === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      {/* The proof — reveals nothing about the secret */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Proof · {proof.proof.length.toLocaleString()} bytes
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <code className="font-data mt-2 block break-all text-xs text-muted-foreground">
          {truncateMiddle(hex)}
        </code>
        <p className="mt-2 text-xs text-muted-foreground/70">
          This proves your secret is in range — yet reveals nothing about it.
        </p>
      </div>

      {/* Verify */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onVerify}
          disabled={verifyState === "verifying"}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {verifyState === "verifying" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          Verify proof
        </button>

        {verifyState === "valid" ? (
          <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-success")}>
            <CheckCircle2 className="size-4" />
            Valid — verified client-side
          </span>
        ) : null}
        {verifyState === "invalid" ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger">
            <AlertCircle className="size-4" />
            Invalid proof
          </span>
        ) : null}
      </div>
    </div>
  );
}
