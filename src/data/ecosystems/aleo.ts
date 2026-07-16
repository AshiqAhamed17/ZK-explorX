import type { EcosystemInput } from "../schema";

export const aleo = {
  slug: "aleo",
  name: "Aleo",
  glyph: "🔒",
  brandColor: "#0AE0A6",
  category: "privacy",
  status: "mainnet",
  tagline:
    "A privacy-focused ZK Layer 1 for private applications, programmable in the Leo language.",
  overview:
    "Aleo is a Layer 1 blockchain designed around zero-knowledge from the base layer up. Applications execute off-chain and submit succinct proofs on-chain, so computation is private and verifiable by default while remaining cheap to verify.\n\nDevelopers build with Leo, a purpose-built language that compiles to Aleo instructions and runs on snarkVM, the ecosystem's zero-knowledge virtual machine, now stewarded by Provable.",
  architecture:
    "Programs written in Leo compile to Aleo bytecode executed by snarkVM, which produces zk-SNARK proofs (Varuna, a Marlin-family proof system). snarkOS nodes reach consensus via AleoBFT and verify proofs rather than re-executing programs, giving the network private, off-chain execution with on-chain verifiability.",
  proofSystem: "zk-SNARK (Varuna / Marlin)",
  vm: "AleoVM (snarkVM)",
  languages: ["Leo", "Aleo Instructions"],
  nativeToken: "ALEO",
  foundation: "Aleo / Provable",
  launchYear: 2024,
  launchTimeline: "Mainnet Sep 2024",
  links: {
    website: "https://aleo.org",
    docs: "https://developer.aleo.org",
    github: "https://github.com/ProvableHQ",
    explorer: "https://explorer.aleo.org",
    blog: "https://aleo.org/blog",
    discord: "https://discord.gg/aleo",
    twitter: "https://twitter.com/AleoHQ",
  },
  repos: [
    { owner: "ProvableHQ", repo: "snarkVM", label: "snarkVM", primary: true },
    { owner: "ProvableHQ", repo: "snarkOS" },
    { owner: "ProvableHQ", repo: "leo", label: "Leo language" },
  ],
  projects: [
    { name: "Leo", category: "Language", description: "Statically-typed language for writing private Aleo applications.", url: "https://leo-lang.org" },
    { name: "Puzzle", category: "Wallet", description: "Wallet and dApp platform for the Aleo ecosystem.", url: "https://puzzle.online" },
    { name: "Arcane Finance", category: "DEX", description: "Fully private DEX on Aleo.", url: "https://www.arcane.finance" },
  ],
} satisfies EcosystemInput;
