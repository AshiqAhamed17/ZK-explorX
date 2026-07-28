"use client";

import { useState } from "react";
import type { ProofData } from "@aztec/bb.js";
import { useProveWorker } from "@/lib/circuits/use-prove-worker";

export default function ProofLabPage() {
  const { prove, verify, stage } = useProveWorker();
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setStatus("proving...");
    setError(null);
    try {
      const proof: ProofData = await prove({ value: 25, min: 18, max: 120 });
      setStatus(`proof generated (${proof.proof.length} bytes), verifying...`);
      const ok = await verify(proof);
      setStatus(ok ? "✅ proof verified" : "❌ verification failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Proof Lab (Web Worker smoke test)</h1>
      <button
        type="button"
        onClick={runTest}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Run test proof
      </button>
      <p className="mt-4 font-mono text-sm">status: {status}</p>
      <p className="font-mono text-sm text-muted-foreground">stage: {stage ?? "—"}</p>
      {error ? <pre className="mt-2 whitespace-pre-wrap text-xs text-danger">{error}</pre> : null}
    </div>
  );
}
