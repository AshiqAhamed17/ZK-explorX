import { ecosystems } from "@/data";
import { scoreAdoption } from "@/lib/adoption";
import { getTvlBySlug } from "@/lib/defillama";
import { getMetricsBySlug } from "@/lib/github";
import { scoreEcosystems, type HealthBreakdown } from "@/lib/health";
import type { EcosystemMetrics, TvlData } from "@/types/metrics";

/** One ecosystem's fully-computed metrics for "today" — the unit both the
 * live page render and the daily snapshot cron persist. */
export interface EcosystemSnapshot {
  slug: string;
  metrics: EcosystemMetrics;
  health: HealthBreakdown;
  /** Live TVL (rollups only), if available. */
  tvl?: TvlData;
  /** 0–100 adoption score, relative to the TVL-bearing cohort (rollups only). */
  adoption?: number;
}

/**
 * Fetch live GitHub metrics + DefiLlama TVL for every curated ecosystem and
 * compute set-relative health scores and cohort-relative adoption scores.
 * Unranked and unsorted — callers that need a leaderboard order (the live
 * pages) sort on `health.score` themselves; the cron job just persists these
 * as-is. All fetches are cached by Next.js (6h).
 */
export async function getTodaysSnapshots(): Promise<EcosystemSnapshot[]> {
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

  return ecosystems.map((ecosystem) => {
    const s = bySlug.get(ecosystem.slug)!;
    return {
      slug: ecosystem.slug,
      metrics: s.metrics,
      health: s.health,
      tvl: tvlBySlug[ecosystem.slug],
      adoption: adoptionBySlug[ecosystem.slug],
    };
  });
}
