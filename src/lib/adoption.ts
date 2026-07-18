import type { TvlData } from "@/types/metrics";

/**
 * Adoption score — a SEPARATE dimension from developer health.
 *
 * The Health Score stays pure (developer activity, not market cap — the whole
 * premise of the project). Adoption is a distinct 0–100 figure derived from
 * TVL, computed only across the cohort of ecosystems that actually have TVL
 * (the rollups), so it never penalizes a zkVM/privacy/L1 for lacking a metric
 * that doesn't apply to it.
 */

/** Log min–max normalize current TVL across the TVL-bearing cohort → 0..100. */
export function scoreAdoption(
  input: { slug: string; tvl?: TvlData }[],
): Record<string, number> {
  const cohort = input.filter(
    (i): i is { slug: string; tvl: TvlData } => !!i.tvl && i.tvl.current > 0,
  );
  if (cohort.length === 0) return {};

  const logs = cohort.map((c) => Math.log1p(c.tvl.current));
  const min = Math.min(...logs);
  const max = Math.max(...logs);

  const out: Record<string, number> = {};
  cohort.forEach((c, i) => {
    const norm = max <= min ? 1 : (logs[i] - min) / (max - min);
    out[c.slug] = Math.round(Math.max(0, Math.min(1, norm)) * 100);
  });
  return out;
}
