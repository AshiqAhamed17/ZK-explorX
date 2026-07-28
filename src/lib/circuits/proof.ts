import { Barretenberg, UltraHonkBackend, type ProofData } from "@aztec/bb.js";
import { Noir, type CompiledCircuit } from "@noir-lang/noir_js";
import circuitArtifact from "../../../circuits/range_proof/target/range_proof.json";

/**
 * Client-side ZK proving for the "range_proof" Noir circuit — proves a
 * private value lies within a public [min, max] range without revealing it.
 *
 * Designed to run inside a Web Worker (see `src/workers/prove.worker.ts`) so
 * proof generation never blocks the UI thread. The Barretenberg WASM backend
 * is expensive to initialize, so it's lazily created once per worker and
 * reused across proofs.
 *
 * `verifierTarget: "evm"` is used consistently for both proving and
 * verifying — it MUST match the target used when generating the Solidity
 * verifier contract, or on-chain verification will reject valid proofs.
 */

const circuit = circuitArtifact as unknown as CompiledCircuit;
const VERIFIER_TARGET = "evm" as const;

export interface RangeProofInput {
  /** The private value — never revealed. */
  value: number;
  /** Public lower bound (inclusive). */
  min: number;
  /** Public upper bound (inclusive). */
  max: number;
}

/** Coarse-grained stages reported while proving — the underlying WASM APIs
 *  don't expose fine-grained percentage progress, so these are the honest
 *  milestones we can actually observe. */
export type ProveStage =
  | "executing-circuit"
  | "initializing-backend"
  | "generating-proof"
  | "verifying";

export type StageCallback = (stage: ProveStage) => void;

let backendPromise: Promise<{ api: Barretenberg; backend: UltraHonkBackend }> | null = null;

function getBackend(onStage?: StageCallback) {
  if (!backendPromise) {
    onStage?.("initializing-backend");
    backendPromise = (async () => {
      const api = await Barretenberg.new();
      const backend = new UltraHonkBackend(circuit.bytecode, api);
      return { api, backend };
    })();
  }
  return backendPromise;
}

/** Generate a proof that `input.value` lies in `[input.min, input.max]`. */
export async function generateRangeProof(
  input: RangeProofInput,
  onStage?: StageCallback,
): Promise<ProofData> {
  onStage?.("executing-circuit");
  const noir = new Noir(circuit);
  const { witness } = await noir.execute({
    value: String(input.value),
    min: String(input.min),
    max: String(input.max),
  });

  const { backend } = await getBackend(onStage);
  onStage?.("generating-proof");
  return backend.generateProof(witness, { verifierTarget: VERIFIER_TARGET });
}

/** Verify a proof client-side (no wallet/chain needed) — an instant "try it" check. */
export async function verifyRangeProof(
  proof: ProofData,
  onStage?: StageCallback,
): Promise<boolean> {
  const { backend } = await getBackend(onStage);
  onStage?.("verifying");
  return backend.verifyProof(proof, { verifierTarget: VERIFIER_TARGET });
}

/** Release the WASM backend's resources. Call when a worker is done proving. */
export async function disposeBackend(): Promise<void> {
  if (!backendPromise) return;
  const { api } = await backendPromise;
  await api.destroy();
  backendPromise = null;
}
