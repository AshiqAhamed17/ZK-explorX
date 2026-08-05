/**
 * Deployed ZK Proof Lab contracts on Ethereum Sepolia, plus the ABIs the app
 * needs to talk to them. Addresses are public and safe to commit.
 *
 * Deployed via `contracts/script/Deploy.ts` (see contracts/deployments/sepolia.json
 * for the full record). Verified end-to-end: a real UltraHonk proof generated
 * by `src/lib/circuits/proof.ts` passes `HonkVerifier.verify` on-chain and a
 * `ProofRegistry.submitProof` transaction emits `ProofVerified`.
 */

export const SEPOLIA_CHAIN_ID = 11_155_111 as const;
export const EXPLORER_URL = "https://sepolia.etherscan.io";

export const CONTRACTS = {
  /** Wraps the verifier; the app calls this to submit proofs on-chain. */
  proofRegistry: "0x43d72f44622E6De811C626760004bA621ee474a9",
  /** Generated UltraHonk verifier the registry delegates to. */
  honkVerifier: "0xca1B13809576a4103Ce306027fDB327ef577b382",
} as const;

/** Etherscan URL for an address on Sepolia. */
export function explorerAddress(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

/** Etherscan URL for a transaction on Sepolia. */
export function explorerTx(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

/** ABI surface the app uses on ProofRegistry (submit + reads + event). */
export const PROOF_REGISTRY_ABI = [
  {
    type: "function",
    name: "submitProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes32[]" },
    ],
    outputs: [{ name: "proofHash", type: "bytes32" }],
  },
  {
    type: "function",
    name: "totalProofs",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "proofCount",
    stateMutability: "view",
    inputs: [{ name: "prover", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "verifier",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "ProofVerified",
    inputs: [
      { name: "prover", type: "address", indexed: true },
      { name: "proofHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  { type: "error", name: "InvalidProof", inputs: [] },
] as const;

/** UltraHonk verifier's read-only verify (for optional off-registry checks). */
export const HONK_VERIFIER_ABI = [
  {
    type: "function",
    name: "verify",
    stateMutability: "view",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes32[]" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
