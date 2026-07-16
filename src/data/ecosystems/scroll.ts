import type { EcosystemInput } from "../schema";

export const scroll = {
  slug: "scroll",
  name: "Scroll",
  glyph: "📜",
  brandColor: "#C99A5B",
  category: "rollup",
  status: "mainnet",
  tagline:
    "A bytecode-equivalent zkEVM rollup focused on being as close to Ethereum as possible.",
  overview:
    "Scroll is a Type-2 zkEVM rollup that aims for maximum equivalence with Ethereum — existing contracts, tooling, and infrastructure work unchanged. Its zkEVM proves the execution of native EVM bytecode, so developers get scaling and validity proofs without leaving the Ethereum developer experience.\n\nScroll grew out of academic zk research and open collaboration with the Ethereum Foundation's Privacy & Scaling Explorations group.",
  architecture:
    "Scroll pairs a modified go-ethereum node with a zkEVM circuit built on Halo2 with KZG commitments. Transactions execute on the L2, a roller network generates proofs of the EVM execution trace, and an aggregated proof is verified on Ethereum L1. Because circuits mirror EVM opcodes, bytecode compiled for Ethereum runs identically on Scroll.",
  proofSystem: "zkEVM (Halo2 / KZG)",
  vm: "zkEVM (Type 2, bytecode-equivalent)",
  languages: ["Solidity", "Vyper"],
  nativeToken: "SCR",
  foundation: "Scroll Foundation",
  launchYear: 2023,
  launchTimeline: "Mainnet Oct 2023 · SCR token Oct 2024",
  links: {
    website: "https://scroll.io",
    docs: "https://docs.scroll.io",
    github: "https://github.com/scroll-tech",
    explorer: "https://scrollscan.com",
    blog: "https://scroll.io/blog",
    discord: "https://discord.gg/scroll",
    twitter: "https://twitter.com/Scroll_ZKP",
  },
  repos: [
    { owner: "scroll-tech", repo: "scroll", label: "scroll (monorepo)", primary: true },
    { owner: "scroll-tech", repo: "zkevm-circuits" },
    { owner: "scroll-tech", repo: "go-ethereum", label: "l2geth" },
  ],
  projects: [
    { name: "Ambient", category: "DEX", description: "Zero-to-one DEX deployed on Scroll.", url: "https://ambient.finance" },
    { name: "Aave", category: "Lending", description: "Blue-chip lending market live on Scroll.", url: "https://aave.com" },
    { name: "Rho Markets", category: "Lending", description: "Native lending protocol on Scroll.", url: "https://www.rhomarkets.xyz" },
  ],
} satisfies EcosystemInput;
