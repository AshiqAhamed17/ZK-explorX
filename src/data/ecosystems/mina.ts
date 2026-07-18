import type { EcosystemInput } from "../schema";

export const mina = {
  slug: "mina",
  name: "Mina",
  glyph: "🪶",
  brandColor: "#E85C33",
  category: "l1",
  status: "mainnet",
  tagline:
    "The succinct blockchain — a ~22 KB chain kept constant-size with recursive zk-SNARKs.",
  overview:
    "Mina is a Layer 1 that stays a fixed ~22 KB in size no matter how many transactions it processes, by replacing the full chain history with a recursive zero-knowledge proof. Any device can verify the entire chain state instantly, making Mina one of the most decentralization-friendly designs in the space.\n\nDevelopers build zkApps in TypeScript using o1js, and the protocol is advanced by O(1) Labs and the Mina Foundation.",
  architecture:
    "Mina uses Pickles, a recursive proof system over the Kimchi (PLONK-based) proving backend. Each block's proof recursively verifies the previous proof, so the chain compresses to a single succinct certificate of validity. zkApps are smart contracts written with o1js that run off-chain and post proofs, enabling private inputs and client-side proving.",
  proofSystem: "Kimchi (PLONK) + Pickles recursion",
  vm: "Account model + zkApps (o1js)",
  languages: ["TypeScript (o1js)", "Rust", "OCaml"],
  nativeToken: "MINA",
  foundation: "Mina Foundation / O(1) Labs",
  launchYear: 2021,
  launchTimeline: "Mainnet Mar 2021 · zkApps on mainnet 2024",
  links: {
    website: "https://minaprotocol.com",
    docs: "https://docs.minaprotocol.com",
    github: "https://github.com/MinaProtocol",
    explorer: "https://minascan.io",
    blog: "https://minaprotocol.com/blog",
    discord: "https://discord.gg/minaprotocol",
    twitter: "https://twitter.com/MinaProtocol",
  },
  repos: [
    { owner: "MinaProtocol", repo: "mina", label: "mina", primary: true },
    { owner: "o1-labs", repo: "o1js", label: "o1js (zkApp SDK)" },
    { owner: "o1-labs", repo: "proof-systems", label: "Kimchi / Pickles" },
  ],
  projects: [
    { name: "o1js", category: "Framework", description: "TypeScript framework for writing zkApps and general zk circuits.", url: "https://docs.minaprotocol.com/zkapps/o1js" },
    { name: "Auro Wallet", category: "Wallet", description: "Popular wallet for the Mina ecosystem.", url: "https://www.aurowallet.com" },
    { name: "Protokit", category: "Framework", description: "Framework for building app-chains on Mina.", url: "https://protokit.dev" },
    { name: "Pallad", category: "Wallet", description: "Community-built wallet for Mina and zkApps.", url: "https://pallad.co" },
    { name: "Zeko", category: "Infrastructure", description: "Layer 2 rollup for Mina built with o1js.", url: "https://zeko.io" },
    { name: "MinaNFT", category: "NFT", description: "NFT standard and platform on Mina.", url: "https://minanft.io" },
  ],
} satisfies EcosystemInput;
