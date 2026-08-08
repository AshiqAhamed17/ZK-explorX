import type { Metadata } from "next";
import { OnchainPulse } from "@/components/proof-lab/onchain-pulse";
import { ProofLab } from "@/components/proof-lab/proof-lab";

export const metadata: Metadata = {
  title: "ZK Proof Lab",
  description:
    "Generate a real zero-knowledge proof in your browser — prove a secret value lies within a range without revealing it, using a Noir circuit and Barretenberg's UltraHonk prover.",
};

export default function ProofLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <span className="font-data inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          Live · Noir + UltraHonk · runs in your browser
        </span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          ZK Proof Lab
        </h1>
        <p className="mt-3 text-muted-foreground">
          Zero-knowledge, made tangible. Prove a secret number falls within a public range —
          like proving you&apos;re old enough without revealing your age — with a real proof
          generated entirely on your device.
        </p>
      </div>

      <div className="mt-6">
        <OnchainPulse />
      </div>

      <div className="mt-8">
        <ProofLab />
      </div>
    </div>
  );
}
