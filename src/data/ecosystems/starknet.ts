import type { EcosystemInput } from "../schema";

export const starknet = {
  slug: "starknet",
  name: "Starknet",
  glyph: "🔺",
  brandColor: "#EC796B",
  category: "rollup",
  status: "mainnet",
  tagline:
    "A permissionless STARK-powered validity rollup on Ethereum, programmed in the Cairo language.",
  overview:
    "Starknet is a Layer 2 built by StarkWare that uses STARK proofs to scale Ethereum without trusted setup. Rather than emulating the EVM, Starknet introduces Cairo — a provable, Turing-complete language — and the Cairo VM, giving developers a native environment designed from the ground up for efficient proving.\n\nThe ecosystem is stewarded by the Starknet Foundation and secured by the STRK token, which is used for fees and staking.",
  architecture:
    "Contracts written in Cairo run on the Cairo VM. A sequencer orders and executes transactions, a prover generates STARK proofs of correct execution, and those proofs are verified by an on-chain verifier on Ethereum. STARKs are transparent (no trusted setup) and post-quantum secure, and recursive proving lets Starknet compress large batches efficiently.",
  proofSystem: "STARK",
  vm: "Cairo VM",
  languages: ["Cairo"],
  nativeToken: "STRK",
  foundation: "StarkWare / Starknet Foundation",
  launchYear: 2021,
  launchTimeline: "Alpha mainnet Nov 2021 · STRK token Feb 2024",
  links: {
    website: "https://www.starknet.io",
    docs: "https://docs.starknet.io",
    github: "https://github.com/starkware-libs",
    explorer: "https://starkscan.co",
    blog: "https://www.starknet.io/blog",
    discord: "https://discord.gg/starknet-community",
    twitter: "https://twitter.com/Starknet",
  },
  repos: [
    { owner: "starkware-libs", repo: "cairo", label: "Cairo compiler", primary: true },
    { owner: "starknet-io", repo: "starknet.js" },
    { owner: "foundry-rs", repo: "starknet-foundry" },
    { owner: "starkware-libs", repo: "sequencer" },
  ],
  projects: [
    { name: "Ekubo", category: "DEX", description: "Concentrated-liquidity AMM built natively on Starknet.", url: "https://ekubo.org" },
    { name: "Argent", category: "Wallet", description: "Smart-contract wallet pioneering account abstraction on Starknet.", url: "https://www.argent.xyz" },
    { name: "Nostra", category: "Lending", description: "Money market and liquidity protocol on Starknet.", url: "https://nostra.finance" },
  ],
} satisfies EcosystemInput;
