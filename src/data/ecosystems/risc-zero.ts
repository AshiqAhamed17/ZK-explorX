import type { EcosystemInput } from "../schema";

export const riscZero = {
  slug: "risc-zero",
  name: "RISC Zero",
  glyph: "🧮",
  brandColor: "#F5A623",
  category: "zkvm",
  status: "mainnet",
  tagline:
    "A general-purpose zero-knowledge virtual machine that proves ordinary Rust running on RISC-V.",
  overview:
    "RISC Zero is a zkVM that lets developers prove the execution of standard programs — written in Rust and compiled to RISC-V — without designing custom circuits. Instead of learning a bespoke ZK language, engineers write normal code and receive a succinct proof that it ran correctly.\n\nRISC Zero powers verifiable off-chain compute for many chains and underlies Boundless, a decentralized proving marketplace.",
  architecture:
    "Programs compile to the RISC-V instruction set and run inside the zkVM guest. The prover produces a zk-STARK attesting to correct execution, with continuations to handle arbitrarily long computations, and can wrap the STARK in a Groth16 SNARK for cheap on-chain verification on Ethereum and other EVM chains.",
  proofSystem: "zk-STARK + recursion (Groth16 wrapper)",
  vm: "RISC-V zkVM",
  languages: ["Rust", "C++", "Solidity"],
  nativeToken: null,
  foundation: "RISC Zero",
  launchYear: 2023,
  launchTimeline: "zkVM 1.0 GA 2024 · Boundless 2025",
  links: {
    website: "https://risczero.com",
    docs: "https://dev.risczero.com",
    github: "https://github.com/risc0",
    blog: "https://risczero.com/blog",
    discord: "https://discord.gg/risczero",
    twitter: "https://twitter.com/RiscZero",
  },
  repos: [
    { owner: "risc0", repo: "risc0", label: "risc0 zkVM", primary: true },
    { owner: "risc0", repo: "risc0-ethereum" },
  ],
  projects: [
    { name: "Bonsai", category: "Infrastructure", description: "Managed proving service for the RISC Zero zkVM.", url: "https://risczero.com/bonsai" },
    { name: "Boundless", category: "Infrastructure", description: "Decentralized marketplace for verifiable compute.", url: "https://boundless.xyz" },
    { name: "Steel", category: "Tooling", description: "Library for verifiable EVM view calls with RISC Zero.", url: "https://risczero.com/steel" },
    { name: "Zeth", category: "Tooling", description: "Type-1 zkEVM block builder and prover running in the zkVM.", url: "https://github.com/risc0/zeth", github: "risc0/zeth" },
    { name: "Kailua", category: "Infrastructure", description: "Hybrid ZK rollup framework for OP Stack chains using RISC Zero.", url: "https://github.com/risc0/kailua", github: "risc0/kailua" },
  ],
} satisfies EcosystemInput;
