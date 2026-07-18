import type { EcosystemInput } from "../schema";

export const sp1 = {
  slug: "sp1",
  name: "SP1",
  glyph: "🛡️",
  brandColor: "#FF5CAA",
  category: "zkvm",
  status: "mainnet",
  tagline:
    "A performant, open-source zkVM by Succinct that proves Rust programs on RISC-V.",
  overview:
    "SP1 is a zero-knowledge virtual machine from Succinct Labs designed for speed and developer ergonomics. Like other zkVMs it proves the execution of Rust compiled to RISC-V, but it emphasizes precompiles and a fast proving pipeline that make real-world workloads — light clients, bridges, rollups — practical to prove.\n\nSP1 is paired with the Succinct Prover Network, a decentralized marketplace that generates proofs on demand.",
  architecture:
    "SP1 executes RISC-V programs and proves them with a STARK/FRI proving system built on Plonky3, accelerated by hand-written precompiles for common operations (hashing, elliptic curves). Proofs can be recursively aggregated and wrapped into a Groth16 or PLONK SNARK for inexpensive verification on Ethereum.",
  proofSystem: "zk-STARK / FRI (Plonky3) + SNARK wrapper",
  vm: "RISC-V zkVM",
  languages: ["Rust", "Solidity"],
  nativeToken: "PROVE",
  foundation: "Succinct Labs",
  launchYear: 2024,
  launchTimeline: "SP1 2024 · Prover Network & PROVE token 2025",
  links: {
    website: "https://succinct.xyz",
    docs: "https://docs.succinct.xyz",
    github: "https://github.com/succinctlabs",
    blog: "https://blog.succinct.xyz",
    discord: "https://discord.gg/succinctlabs",
    twitter: "https://twitter.com/SuccinctLabs",
  },
  repos: [
    { owner: "succinctlabs", repo: "sp1", label: "sp1 zkVM", primary: true },
    { owner: "succinctlabs", repo: "sp1-contracts" },
  ],
  projects: [
    { name: "Succinct Prover Network", category: "Infrastructure", description: "Decentralized network for generating SP1 proofs on demand.", url: "https://succinct.xyz" },
    { name: "SP1 Helios", category: "Infrastructure", description: "ZK Ethereum light client built with SP1.", url: "https://github.com/succinctlabs/sp1-helios" },
    { name: "OP Succinct", category: "Infrastructure", description: "Turns any OP Stack chain into a ZK rollup using SP1.", url: "https://github.com/succinctlabs/op-succinct", github: "succinctlabs/op-succinct" },
    { name: "SP1 Reth", category: "Infrastructure", description: "Performant type-1 zkEVM reference built on SP1.", url: "https://github.com/succinctlabs/rsp", github: "succinctlabs/rsp" },
    { name: "SP1 Blobstream", category: "Bridge", description: "ZK bridge relaying Celestia data-availability roots using SP1.", url: "https://github.com/succinctlabs/sp1-blobstream", github: "succinctlabs/sp1-blobstream" },
    { name: "SP1 Contract Calls", category: "Tooling", description: "Library for verifiable Ethereum view calls proven with SP1.", url: "https://github.com/succinctlabs/sp1-contract-call", github: "succinctlabs/sp1-contract-call" },
  ],
} satisfies EcosystemInput;
