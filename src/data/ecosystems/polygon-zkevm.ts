import type { EcosystemInput } from "../schema";

export const polygonZkevm = {
  slug: "polygon-zkevm",
  name: "Polygon zkEVM",
  glyph: "🟣",
  brandColor: "#7B3FE4",
  category: "rollup",
  status: "mainnet",
  tagline:
    "An EVM-equivalent zkEVM rollup and the ZK foundation of Polygon's AggLayer and CDK.",
  overview:
    "Polygon zkEVM is a validity rollup from Polygon Labs offering EVM equivalence with succinct proofs. It underpins Polygon's broader ZK strategy: the Chain Development Kit (CDK) lets teams spin up ZK-powered L2s, and the AggLayer aims to unify liquidity and state across them.\n\nThe network is secured by the POL token, the upgraded successor to MATIC.",
  architecture:
    "Execution happens on a zkEVM node; a prover generates zk-STARK proofs of execution using Plonky2, which are then wrapped into a compact SNARK for cheap verification on Ethereum L1. The two-layer STARK→SNARK design combines fast proving with small, inexpensive on-chain proofs.",
  proofSystem: "zk-STARK + SNARK (Plonky2)",
  vm: "zkEVM (Type 3 → 2)",
  languages: ["Solidity", "Vyper"],
  nativeToken: "POL",
  foundation: "Polygon Labs",
  launchYear: 2023,
  launchTimeline: "Mainnet beta Mar 2023 · CDK & AggLayer 2024",
  defiLlamaSlug: "Polygon zkEVM",
  links: {
    website: "https://polygon.technology/polygon-zkevm",
    docs: "https://docs.polygon.technology/zkEVM/",
    github: "https://github.com/0xPolygonHermez",
    explorer: "https://zkevm.polygonscan.com",
    blog: "https://polygon.technology/blog",
    discord: "https://discord.com/invite/0xpolygon",
    twitter: "https://twitter.com/0xPolygon",
  },
  repos: [
    { owner: "0xPolygonHermez", repo: "zkevm-node", label: "zkevm-node", primary: true },
    { owner: "0xPolygonHermez", repo: "zkevm-prover" },
    { owner: "0xPolygonHermez", repo: "zkevm-contracts" },
  ],
  projects: [
    { name: "Quickswap", category: "DEX", description: "Major DEX deployed on Polygon zkEVM.", url: "https://quickswap.exchange" },
    { name: "Balancer", category: "DEX", description: "Automated portfolio manager and DEX on Polygon zkEVM.", url: "https://balancer.fi" },
    { name: "0VIX", category: "Lending", description: "Lending market native to Polygon zkEVM.", url: "https://www.0vix.com" },
    { name: "SushiSwap", category: "DEX", description: "Multi-chain DEX deployed on Polygon zkEVM.", url: "https://www.sushi.com" },
    { name: "Pendle", category: "Infrastructure", description: "Yield-tokenization protocol available on Polygon zkEVM.", url: "https://www.pendle.finance" },
    { name: "AggLayer", category: "Infrastructure", description: "Cross-chain settlement layer unifying Polygon CDK chains.", url: "https://polygon.technology/agglayer" },
  ],
} satisfies EcosystemInput;
