import type { ProofData } from "@aztec/bb.js";
import type { ProveStage, RangeProofInput } from "@/lib/circuits/proof";

export type WorkerRequest =
  | { type: "prove"; id: string; input: RangeProofInput }
  | { type: "verify"; id: string; proof: ProofData };

export type WorkerResponse =
  | { type: "stage"; id: string; stage: ProveStage }
  | { type: "prove-result"; id: string; proof: ProofData }
  | { type: "verify-result"; id: string; verified: boolean }
  | { type: "error"; id: string; message: string };
