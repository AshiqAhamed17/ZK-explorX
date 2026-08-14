import { ecosystems } from "@/data";
import type { Ecosystem } from "@/data/schema";
import type { HealthBreakdown } from "@/lib/health";
import { getTodaysSnapshots } from "@/lib/metrics/snapshot";
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
 * Load every ecosystem, join it with today's computed snapshot (live GitHub
 * metrics + DefiLlama TVL, health + adoption scores — shared with the daily
 * cron via `getTodaysSnapshots`), and return them ranked best-first by
 * health. All fetches are cached by Next.js (6h).
 */
export async function getRankedEcosystems(): Promise<RankedEcosystem[]> {
  const snapshots = await getTodaysSnapshots();
  const bySlug = new Map(snapshots.map((s) => [s.slug, s]));

  return ecosystems
    .map((ecosystem) => {
      const s = bySlug.get(ecosystem.slug)!;
      return {
        ecosystem,
        metrics: s.metrics,
        health: s.health,
        tvl: s.tvl,
        adoption: s.adoption,
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
