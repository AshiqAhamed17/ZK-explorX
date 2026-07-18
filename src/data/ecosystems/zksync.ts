import type { EcosystemInput } from "../schema";

export const zksync = {
  slug: "zksync",
  name: "ZKsync",
  glyph: "⚡",
  brandColor: "#1755F4",
  category: "rollup",
  status: "mainnet",
  tagline:
    "A ZK rollup scaling Ethereum with an EVM-compatible zkEVM and a vision for a network of hyperchains.",
  overview:
    "ZKsync, built by Matter Labs, is one of the earliest production ZK rollups on Ethereum. ZKsync Era brings full EVM compatibility to a validity-proven L2, letting Solidity developers deploy with minimal changes while inheriting Ethereum security through validity proofs.\n\nThe project is evolving into the Elastic Network — a set of interoperable ZK chains (hyperchains) sharing a common proof system and messaging layer, coordinated by the ZKsync Association.",
  architecture:
    "Transactions are executed on EraVM, a custom zkEVM, then batched and proven with the Boojum proof system (a STARK/FRI prover) before a succinct validity proof is verified on Ethereum L1. The ZK Stack lets teams launch sovereign hyperchains that settle to Ethereum and interoperate through shared bridges.",
  proofSystem: "PLONK + Boojum (STARK/FRI)",
  vm: "EraVM (zkEVM)",
  languages: ["Solidity", "Vyper", "Rust"],
  nativeToken: "ZK",
  foundation: "Matter Labs / ZKsync Association",
  launchYear: 2023,
  launchTimeline: "zkSync Lite 2020 · Era mainnet Mar 2023 · ZK token Jun 2024",
  defiLlamaSlug: "ZKsync Era",
  links: {
    website: "https://zksync.io",
    docs: "https://docs.zksync.io",
    github: "https://github.com/matter-labs",
    explorer: "https://explorer.zksync.io",
    blog: "https://blog.matter-labs.io",
    discord: "https://join.zksync.dev",
    twitter: "https://twitter.com/zksync",
  },
  repos: [
    { owner: "matter-labs", repo: "zksync-era", label: "zksync-era", primary: true },
    { owner: "matter-labs", repo: "foundry-zksync" },
    { owner: "matter-labs", repo: "era-boojum", label: "Boojum prover" },
  ],
  projects: [
    { name: "SyncSwap", category: "DEX", description: "Leading AMM DEX on ZKsync Era.", url: "https://syncswap.xyz" },
    { name: "ZeroLend", category: "Lending", description: "Money market for ZKsync and the Elastic Network.", url: "https://zerolend.xyz" },
    { name: "Zerion", category: "Wallet", description: "Multi-chain wallet with ZKsync support.", url: "https://zerion.io" },
    { name: "Maverick Protocol", category: "DEX", description: "Dynamic-distribution AMM live on ZKsync Era.", url: "https://www.mav.xyz" },
    { name: "Aave", category: "Lending", description: "Blue-chip lending market deployed on ZKsync Era.", url: "https://aave.com" },
    { name: "Rhino.fi", category: "Bridge", description: "Cross-chain bridge and DEX aggregator supporting ZKsync.", url: "https://rhino.fi" },
    { name: "Holdstation", category: "Wallet", description: "Smart-contract wallet and perp DEX on ZKsync.", url: "https://holdstation.com" },
  ],
} satisfies EcosystemInput;
