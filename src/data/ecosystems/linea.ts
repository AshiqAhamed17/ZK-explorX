import type { EcosystemInput } from "../schema";

export const linea = {
  slug: "linea",
  name: "Linea",
  glyph: "📐",
  brandColor: "#61DFFF",
  category: "rollup",
  status: "mainnet",
  tagline:
    "A developer-friendly zkEVM rollup from Consensys, tightly integrated with MetaMask and Infura.",
  overview:
    "Linea is a Type-2 zkEVM rollup built by Consensys, the team behind MetaMask, Infura, and Truffle. It targets a familiar Ethereum developer experience with deep integration into Consensys' widely used tooling, making onboarding for existing Ethereum teams straightforward.\n\nProofs are generated with gnark, Consensys' high-performance zk-SNARK library.",
  architecture:
    "Linea executes EVM transactions and proves them with a zk-SNARK proving stack built on gnark, using a lattice-based commitment scheme designed for fast proving. A sequencer orders transactions, a prover produces validity proofs, and a bridge relayer settles state and messages to Ethereum L1.",
  proofSystem: "zk-SNARK (gnark)",
  vm: "zkEVM (Type 2)",
  languages: ["Solidity", "Vyper"],
  nativeToken: "LINEA",
  foundation: "Consensys",
  launchYear: 2023,
  launchTimeline: "Mainnet alpha Jul 2023 · LINEA token 2025",
  defiLlamaSlug: "Linea",
  links: {
    website: "https://linea.build",
    docs: "https://docs.linea.build",
    github: "https://github.com/Consensys",
    explorer: "https://lineascan.build",
    blog: "https://linea.build/blog",
    discord: "https://discord.gg/linea",
    twitter: "https://twitter.com/LineaBuild",
  },
  repos: [
    { owner: "Consensys", repo: "linea-monorepo", label: "linea-monorepo", primary: true },
    { owner: "Consensys", repo: "gnark", label: "gnark prover" },
    { owner: "Consensys", repo: "linea-specification" },
  ],
  projects: [
    { name: "MetaMask", category: "Wallet", description: "Consensys' flagship wallet, natively integrated with Linea.", url: "https://metamask.io" },
    { name: "Lynex", category: "DEX", description: "ve(3,3) DEX and liquidity layer on Linea.", url: "https://www.lynex.fi" },
    { name: "Mendi Finance", category: "Lending", description: "Lending market native to Linea.", url: "https://mendi.finance" },
    { name: "Nile Exchange", category: "DEX", description: "ve(3,3) DEX and liquidity layer on Linea.", url: "https://www.nile.build" },
    { name: "ZeroLend", category: "Lending", description: "Money market on Linea and the wider ZK landscape.", url: "https://zerolend.xyz" },
    { name: "Infura", category: "Infrastructure", description: "RPC and node infrastructure for Linea, by Consensys.", url: "https://www.infura.io" },
  ],
} satisfies EcosystemInput;
