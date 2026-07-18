import { ecosystems } from "@/data";
import type { Ecosystem } from "@/data/schema";
import { scoreAdoption } from "@/lib/adoption";
import { getTvlBySlug } from "@/lib/defillama";
import { getMetricsBySlug } from "@/lib/github";
import { scoreEcosystems, type HealthBreakdown } from "@/lib/health";
import type { EcosystemMetrics, TvlData } from "@/types/metrics";

/** An ecosystem joined with its live metrics, health breakdown, TVL, and rank. */
export interface RankedEcosystem {
  ecosystem: Ecosystem;
  metrics: EcosystemMetrics;
  health: HealthBreakdown;
  rank: number;
  /** Live TVL (rollups only), if available. */
  tvl?: TvlData;
  /** 0–100 adoption score, relative to the TVL-bearing cohort (rollups only). */
  adoption?: number;
}

/**
 * Load every ecosystem, fetch live GitHub metrics + DefiLlama TVL, compute
 * set-relative health scores and cohort-relative adoption scores, and return
 * them ranked best-first by health. All fetches are cached by Next.js (6h).
 */
export async function getRankedEcosystems(): Promise<RankedEcosystem[]> {
  const [metricsBySlug, tvlBySlug] = await Promise.all([
    getMetricsBySlug(
      ecosystems.map((e) => ({
        slug: e.slug,
        repos: e.repos,
        projectCount: e.projects.length,
      })),
    ),
    getTvlBySlug(
      ecosystems.map((e) => ({ slug: e.slug, defiLlamaSlug: e.defiLlamaSlug })),
    ),
  ]);

  const scored = scoreEcosystems(
    ecosystems.map((e) => ({ slug: e.slug, metrics: metricsBySlug[e.slug] })),
  );
  const bySlug = new Map(scored.map((s) => [s.slug, s]));

  const adoptionBySlug = scoreAdoption(
    ecosystems.map((e) => ({ slug: e.slug, tvl: tvlBySlug[e.slug] })),
  );

  return ecosystems
    .map((ecosystem) => {
      const s = bySlug.get(ecosystem.slug)!;
      return {
        ecosystem,
        metrics: s.metrics,
        health: s.health,
        tvl: tvlBySlug[ecosystem.slug],
        adoption: adoptionBySlug[ecosystem.slug],
      };
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
