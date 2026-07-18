import { ecosystems } from "@/data";
import type { Ecosystem } from "@/data/schema";
import { getMetricsBySlug } from "@/lib/github";
import { scoreEcosystems, type HealthBreakdown } from "@/lib/health";
import type { EcosystemMetrics } from "@/types/metrics";

/** An ecosystem joined with its live metrics, health breakdown, and rank. */
export interface RankedEcosystem {
  ecosystem: Ecosystem;
  metrics: EcosystemMetrics;
  health: HealthBreakdown;
  rank: number;
}

/**
 * Load every ecosystem, fetch live GitHub metrics, compute set-relative health
 * scores, and return them ranked best-first. Underlying GitHub fetches are
 * cached by Next.js (6h), so this stays cheap after the first render.
 */
export async function getRankedEcosystems(): Promise<RankedEcosystem[]> {
  const metricsBySlug = await getMetricsBySlug(
    ecosystems.map((e) => ({
      slug: e.slug,
      repos: e.repos,
      projectCount: e.projects.length,
    })),
  );

  const scored = scoreEcosystems(
    ecosystems.map((e) => ({ slug: e.slug, metrics: metricsBySlug[e.slug] })),
  );
  const bySlug = new Map(scored.map((s) => [s.slug, s]));

  return ecosystems
    .map((ecosystem) => {
      const s = bySlug.get(ecosystem.slug)!;
      return { ecosystem, metrics: s.metrics, health: s.health };
    })
    .sort((a, b) => b.health.score - a.health.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function getRankedEcosystem(
  slug: string,
): Promise<RankedEcosystem | undefined> {
  const all = await getRankedEcosystems();
  return all.find((r) => r.ecosystem.slug === slug);
}
