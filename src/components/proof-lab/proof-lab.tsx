"use client";

import type { ProofData } from "@aztec/bb.js";
import { useState } from "react";
import { AlertCircle, Eye, Fingerprint, Lock, ShieldCheck } from "lucide-react";
import { useProveWorker } from "@/lib/circuits/use-prove-worker";
import type { RangeProofInput } from "@/lib/circuits/proof";
import { ProofForm } from "@/components/proof-lab/proof-form";
import { ProofResult, type VerifyState } from "@/components/proof-lab/proof-result";
import { ProofWorkerStatus } from "@/components/proof-lab/proof-status";

export function ProofLab() {
  const { prove, verify, stage } = useProveWorker();

  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [publicRange, setPublicRange] = useState<{ min: number; max: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");

  async function handleGenerate(input: RangeProofInput) {
    setBusy(true);
    setError(null);
    setProof(null);
    setVerifyState("idle");
    setPublicRange({ min: input.min, max: input.max });
    try {
      const result = await prove(input);
      setProof(result);
    } catch (e) {
      const outOfRange = input.value < input.min || input.value > input.max;
      setError(
        outOfRange
          ? "No valid proof exists: your secret isn't within [min, max]. A ZK proof can only be produced for a true statement — that's soundness."
          : e instanceof Error
            ? e.message
            : String(e),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!proof) return;
    setVerifyState("verifying");
    try {
      const ok = await verify(proof);
      setVerifyState(ok ? "valid" : "invalid");
    } catch {
      setVerifyState("invalid");
    }
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Statement */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-medium">
            <span className="font-data mr-2 text-primary">01</span>
            Your statement
          </h2>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            &ldquo;My secret value is between min and max&rdquo; — e.g. proving you&apos;re over
            18 without revealing your age.
          </p>
          <ProofForm onGenerate={handleGenerate} busy={busy} />
        </section>

        {/* Proof */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-medium">
            <span className="font-data mr-2 text-primary">02</span>
            Proof
          </h2>
          <div className="mt-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : proof && publicRange ? (
              <ProofResult
                proof={proof}
                publicRange={publicRange}
                verifyState={verifyState}
                onVerify={handleVerify}
              />
            ) : busy ? (
              <ProofWorkerStatus current={stage} proved={false} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
                <Fingerprint className="size-6 text-muted-foreground/50" />
                <p className="max-w-xs text-sm text-muted-foreground">
                  Enter a value and generate a proof. Everything runs locally in your browser.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* What just happened */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-sm font-medium">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "Private input stays local",
              body: "Your secret value is used to compute a witness in your browser. It never leaves the device and never enters the proof.",
            },
            {
              icon: Eye,
              title: "Public inputs are shared",
              body: "Only the range [min, max] is public. A verifier sees the bounds, not the value being proven to sit inside them.",
            },
            {
              icon: ShieldCheck,
              title: "The proof convinces anyone",
              body: "The UltraHonk proof cryptographically attests the hidden value is in range — verifiable by anyone, revealing nothing else.",
            },
          ].map((c) => (
            <div key={c.title} className="flex flex-col gap-1.5">
              <c.icon className="size-4 text-primary" />
              <div className="text-sm font-medium">{c.title}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Next up:</span> anchor a proof on-chain —
          connect a wallet and submit it to a Solidity verifier contract on Sepolia. Coming in a
          later update.
        </p>
      </section>
    </div>
  );
}
