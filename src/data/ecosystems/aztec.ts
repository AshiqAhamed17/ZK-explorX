import type { EcosystemInput } from "../schema";

export const aztec = {
  slug: "aztec",
  name: "Aztec",
  glyph: "🔮",
  brandColor: "#8C7CF0",
  category: "privacy",
  status: "testnet",
  tagline:
    "A privacy-first ZK network where confidential smart contracts are written in the Noir language.",
  overview:
    "Aztec is a fully programmable private ZK network built by Aztec Labs. Unlike transparent rollups, Aztec makes privacy the default: state and function execution can be kept confidential using client-side proving, while still settling to Ethereum.\n\nDevelopers write contracts in Noir, Aztec's Rust-inspired language for zero-knowledge circuits, which has grown into a general-purpose ZK DSL used well beyond Aztec itself.",
  architecture:
    "Contracts compile from Noir to circuits proven with Barretenberg (PLONK/UltraHonk). Private functions execute on the user's device in the Private Execution Environment (PXE), producing proofs that reveal nothing about inputs, while public functions run on the Aztec VM. A sequencer and prover network aggregate these into rollup proofs verified on Ethereum L1.",
  proofSystem: "PLONK / UltraHonk (Barretenberg)",
  vm: "Aztec VM (private + public execution)",
  languages: ["Noir"],
  nativeToken: null,
  foundation: "Aztec Labs",
  launchYear: 2022,
  launchTimeline: "Public testnet 2025 · mainnet upcoming",
  links: {
    website: "https://aztec.network",
    docs: "https://docs.aztec.network",
    github: "https://github.com/AztecProtocol",
    blog: "https://aztec.network/blog",
    discord: "https://discord.gg/aztec",
    twitter: "https://twitter.com/aztecnetwork",
  },
  repos: [
    { owner: "AztecProtocol", repo: "aztec-packages", label: "aztec-packages", primary: true },
    { owner: "noir-lang", repo: "noir", label: "Noir language" },
  ],
  projects: [
    { name: "Noir", category: "Language", description: "Domain-specific language for writing ZK circuits, used across the ecosystem.", url: "https://noir-lang.org" },
    { name: "Aztec.nr", category: "Framework", description: "Smart-contract framework for writing private Aztec contracts in Noir.", url: "https://docs.aztec.network" },
    { name: "Barretenberg", category: "Infrastructure", description: "PLONK/UltraHonk proving backend powering Aztec and Noir.", url: "https://github.com/AztecProtocol/aztec-packages", github: "AztecProtocol/aztec-packages" },
    { name: "Nargo", category: "Tooling", description: "Noir's package manager and build tool.", url: "https://noir-lang.org", github: "noir-lang/noir" },
    { name: "zkPassport", category: "Identity", description: "Privacy-preserving identity and passport proofs built with Noir.", url: "https://zkpassport.id" },
  ],
} satisfies EcosystemInput;
