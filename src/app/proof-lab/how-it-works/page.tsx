import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CONTRACTS, explorerAddress } from "@/lib/contracts/verifier";

export const metadata: Metadata = {
  title: "How the Proof Lab Works",
  description:
    "Circuit, witness, proof, verification — how the ZK Proof Lab turns a private value into a real, on-chain-verified zero-knowledge proof.",
};

function GlossaryLink({ id, term }: { id: string; term: string }) {
  return (
    <Link href={`/primitives#${id}`} className="text-primary hover:underline">
      {term} ↗
    </Link>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-data text-sm text-muted-foreground">
        {n}
      </div>
      <div className="pb-8">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/proof-lab"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Proof Lab
      </Link>

      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        How the Proof Lab Works
      </h1>
      <p className="mt-3 text-muted-foreground">
        The Proof Lab proves that a private number falls within a public range,
        without ever revealing the number. Here&apos;s exactly what happens between
        clicking &ldquo;Generate Proof&rdquo; and a real Ethereum transaction confirming
        it&apos;s true — no black box.
      </p>

      <div className="mt-10 flex flex-col border-l border-border pl-6">
        <Step n={1} title="Circuit">
          <p>
            The circuit (
            <code className="font-data text-xs">circuits/range_proof/src/main.nr</code>) is
            two assertions: <code className="font-data text-xs">value ≥ min</code> and{" "}
            <code className="font-data text-xs">value ≤ max</code>. Compiling it with Noir
            turns those assertions into an arithmetic circuit — a system of polynomial
            constraints a proof system can reason about. That translation, from
            ordinary-looking code to constraint math, is called{" "}
            <GlossaryLink id="circuit" term="arithmetization" />.
          </p>
        </Step>

        <Step n={2} title="Witness">
          <p>
            Clicking &ldquo;Generate Proof&rdquo; runs the circuit in your browser with your private
            value plus the public <code className="font-data text-xs">min</code>/
            <code className="font-data text-xs">max</code>, computing the{" "}
            <GlossaryLink id="witness" term="witness" /> — the specific values that satisfy
            every constraint. The witness never leaves your device; it exists only in
            memory for the moment it takes to turn it into a proof.
          </p>
        </Step>

        <Step n={3} title="Proof">
          <p>
            The witness is handed to Barretenberg&apos;s UltraHonk backend — a{" "}
            <GlossaryLink id="plonk" term="PLONK" />-family{" "}
            <GlossaryLink id="snark" term="SNARK" /> — running as WebAssembly inside a Web
            Worker, so proving never blocks the page. UltraHonk turns the witness into a
            proof: a few kilobytes that convince anyone the constraints hold, without
            revealing which private value satisfied them. Everything so far has happened
            entirely on your device.
          </p>
        </Step>

        <Step n={4} title="Verification">
          <p>
            The Proof Lab offers two checks. An instant client-side check runs the same
            UltraHonk backend&apos;s <code className="font-data text-xs">verifyProof</code> — a
            sanity check, no wallet needed. The real one submits the proof and its public
            inputs to{" "}
            <a
              href={explorerAddress(CONTRACTS.proofRegistry)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ProofRegistry
            </a>
            , deployed on Ethereum Sepolia, which delegates to a generated{" "}
            <a
              href={explorerAddress(CONTRACTS.honkVerifier)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              HonkVerifier
            </a>{" "}
            contract. The{" "}
            <GlossaryLink id="prover-verifier" term="prover and verifier" /> roles play out
            for real here: a successful transaction emits{" "}
            <code className="font-data text-xs">ProofVerified</code> — a state change on a
            public blockchain anyone can audit, at a fraction of the cost of re-running the
            original check on-chain.
          </p>
        </Step>
      </div>

      <div className="mt-2 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Ready to try it with a real proof?
        </p>
        <Link
          href="/proof-lab"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open the Proof Lab <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
