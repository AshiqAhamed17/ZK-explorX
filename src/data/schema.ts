import { z } from "zod";

/**
 * Curated data schema for the ZK-explorX ecosystem directory.
 *
 * Everything here is hand-authored, slow-changing metadata. Fast-moving,
 * quantitative signals (stars, commits, releases, …) are fetched live from
 * GitHub at request time — never stored here. The Zod schema is the single
 * source of truth for both validation (fails the build on bad data) and the
 * TypeScript types used throughout the app.
 */

/** High-level classification used for filtering in the directory. */
export const CATEGORIES = [
  "rollup", // ZK L2 rollups (zkSync, Scroll, Linea, Polygon zkEVM, Starknet)
  "zkvm", // general-purpose zero-knowledge VMs (RISC Zero, SP1)
  "privacy", // privacy-first ecosystems (Aztec, Aleo)
  "l1", // ZK-native layer 1s (Mina)
] as const;

export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  rollup: "ZK Rollup",
  zkvm: "zkVM",
  privacy: "Privacy",
  l1: "ZK Layer 1",
};

/** Network maturity. */
export const StatusSchema = z.enum(["mainnet", "testnet", "devnet"]);
export type Status = z.infer<typeof StatusSchema>;

/** A curated GitHub repository whose live metrics feed the health score. */
export const RepoRefSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  /** Short human label; defaults to the repo name in the UI. */
  label: z.string().optional(),
  /** The single canonical/flagship repo, surfaced first. */
  primary: z.boolean().optional(),
});
export type RepoRef = z.infer<typeof RepoRefSchema>;

/** A project/application living inside an ecosystem (Project Explorer, V1). */
export const ProjectSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1), // e.g. "Wallet", "DEX", "Bridge", "Tooling"
  description: z.string().min(1),
  url: z.string().url().optional(),
  github: z.string().optional(), // "owner/repo"
});
export type Project = z.infer<typeof ProjectSchema>;

/** Curated external resource links. */
export const LinksSchema = z.object({
  website: z.string().url(),
  docs: z.string().url(),
  github: z.string().url(), // org/user URL
  explorer: z.string().url().optional(),
  whitepaper: z.string().url().optional(),
  blog: z.string().url().optional(),
  discord: z.string().url().optional(),
  twitter: z.string().url().optional(),
  forum: z.string().url().optional(),
});
export type Links = z.infer<typeof LinksSchema>;

export const EcosystemSchema = z.object({
  /** URL-safe unique id, e.g. "zksync". Must match the filename. */
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  name: z.string().min(1),
  /** Emoji or short glyph used as a lightweight logo. */
  glyph: z.string().min(1),
  /** Brand accent color (hex) for subtle per-ecosystem theming. */
  brandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "brandColor must be a 6-digit hex"),
  category: CategorySchema,
  status: StatusSchema,

  /** One-line summary for cards. */
  tagline: z.string().min(1).max(160),
  /** Full prose overview (supports plain paragraphs, split on \n\n). */
  overview: z.string().min(1),
  /** How it works, architecturally. */
  architecture: z.string().min(1),

  // --- Technology facts ---
  proofSystem: z.string().min(1), // e.g. "PLONK / Halo2", "STARK", "PLONKish"
  vm: z.string().min(1), // e.g. "zkEVM", "Cairo VM", "RISC-V"
  languages: z.array(z.string().min(1)).min(1), // dev languages
  nativeToken: z.string().nullable(), // ticker or null if none
  foundation: z.string().min(1), // stewarding org/company
  launchYear: z.number().int().gte(2015).lte(2035),
  launchTimeline: z.string().min(1), // short milestone note

  /** DefiLlama chain name for live TVL (rollups only), e.g. "ZKsync Era". */
  defiLlamaSlug: z.string().optional(),

  links: LinksSchema,

  /** Curated repos that define this ecosystem's core developer activity. */
  repos: z.array(RepoRefSchema).min(1),

  /** Representative projects/apps (optional in MVP, powers V1 explorer). */
  projects: z.array(ProjectSchema).default([]),
});

export type Ecosystem = z.infer<typeof EcosystemSchema>;
/** Input shape (before Zod applies defaults) — used when authoring data. */
export type EcosystemInput = z.input<typeof EcosystemSchema>;
