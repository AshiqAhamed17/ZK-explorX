import type { TvlData, TvlPoint } from "@/types/metrics";

/**
 * DefiLlama live-TVL layer.
 *
 * Mirrors the resilience approach of `src/lib/github.ts`: native `fetch` so we
 * get Next.js ISR caching for free, a per-request timeout, and graceful
 * fallback to `null` (never throws) so a missing/slow chain degrades to "no
 * TVL panel" instead of breaking a page. No key required, generous limits.
 *
 * TVL is a rollup metric — only ecosystems with a `defiLlamaSlug` are queried;
 * zkVMs, privacy networks, and L1s legitimately have no chain TVL.
 */

const REVALIDATE_SECONDS = 21_600; // 6h, matches the GitHub layer
const REQUEST_TIMEOUT_MS = 10_000;

/** Trim the daily history to the trailing `days` for lighter payloads/charts. */
function trimHistory(points: TvlPoint[], days: number): TvlPoint[] {
  if (points.length <= days) return points;
  return points.slice(points.length - days);
}

/**
 * Current TVL + daily history for one chain, or null if unavailable.
 * @param chainName DefiLlama chain "name" (e.g. "ZKsync Era").
 */
export async function getChainTvl(chainName: string): Promise<TvlData | null> {
  try {
    const url = `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(chainName)}`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as { date: number; tvl: number }[];
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const history = trimHistory(
      raw
        .filter((p) => typeof p?.tvl === "number" && typeof p?.date === "number")
        .map((p) => ({ date: p.date, tvl: p.tvl })),
      365,
    );
    if (history.length === 0) return null;

    return { current: history[history.length - 1].tvl, history };
  } catch {
    return null;
  }
}

/** Fetch TVL for many ecosystems in parallel, keyed by slug (skips those with no chain). */
export async function getTvlBySlug(
  items: { slug: string; defiLlamaSlug?: string }[],
): Promise<Record<string, TvlData>> {
  const withChain = items.filter((i) => i.defiLlamaSlug);
  const entries = await Promise.all(
    withChain.map(async (i) => [i.slug, await getChainTvl(i.defiLlamaSlug!)] as const),
  );
  const out: Record<string, TvlData> = {};
  for (const [slug, tvl] of entries) {
    if (tvl) out[slug] = tvl;
  }
  return out;
}
