import {
  EcosystemSchema,
  type Category,
  type Ecosystem,
  type Project,
} from "./schema";

import { zksync } from "./ecosystems/zksync";
import { starknet } from "./ecosystems/starknet";
import { scroll } from "./ecosystems/scroll";
import { polygonZkevm } from "./ecosystems/polygon-zkevm";
import { linea } from "./ecosystems/linea";
import { aztec } from "./ecosystems/aztec";
import { aleo } from "./ecosystems/aleo";
import { mina } from "./ecosystems/mina";
import { riscZero } from "./ecosystems/risc-zero";
import { sp1 } from "./ecosystems/sp1";

/**
 * Central registry. Every curated ecosystem is validated against the Zod
 * schema at module load — malformed data throws immediately (and fails the
 * build), so the rest of the app can trust these objects completely.
 */
const raw = [
  zksync,
  starknet,
  scroll,
  polygonZkevm,
  linea,
  aztec,
  aleo,
  mina,
  riscZero,
  sp1,
];

function loadEcosystems(): Ecosystem[] {
  const parsed = raw.map((e) => {
    const result = EcosystemSchema.safeParse(e);
    if (!result.success) {
      const slug = (e as { slug?: string }).slug ?? "<unknown>";
      throw new Error(
        `Invalid ecosystem data for "${slug}":\n${result.error.toString()}`,
      );
    }
    return result.data;
  });

  const slugs = new Set<string>();
  for (const e of parsed) {
    if (slugs.has(e.slug)) throw new Error(`Duplicate ecosystem slug: ${e.slug}`);
    slugs.add(e.slug);
  }

  return parsed.sort((a, b) => a.name.localeCompare(b.name));
}

export const ecosystems: Ecosystem[] = loadEcosystems();

export const ecosystemsBySlug: Record<string, Ecosystem> = Object.fromEntries(
  ecosystems.map((e) => [e.slug, e]),
);

export function getEcosystem(slug: string): Ecosystem | undefined {
  return ecosystemsBySlug[slug];
}

export const allSlugs: string[] = ecosystems.map((e) => e.slug);

/** Distinct categories present in the data, in a stable display order. */
export const CATEGORY_ORDER: Category[] = ["rollup", "zkvm", "privacy", "l1"];

export const usedCategories: Category[] = CATEGORY_ORDER.filter((c) =>
  ecosystems.some((e) => e.category === c),
);

/** A project flattened with a back-reference to its ecosystem (Project Explorer). */
export interface EnrichedProject extends Project {
  ecosystemSlug: string;
  ecosystemName: string;
  glyph: string;
}

/** Every project across all ecosystems, for the /projects explorer. */
export const allProjects: EnrichedProject[] = ecosystems.flatMap((e) =>
  e.projects.map((p) => ({
    ...p,
    ecosystemSlug: e.slug,
    ecosystemName: e.name,
    glyph: e.glyph,
  })),
);

/** Distinct project categories present, sorted by frequency then name. */
export const projectCategories: string[] = Array.from(
  allProjects.reduce((m, p) => m.set(p.category, (m.get(p.category) ?? 0) + 1), new Map<string, number>()),
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([c]) => c);
