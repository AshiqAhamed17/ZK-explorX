import type { EcosystemMetrics } from "@/types/metrics";

/**
 * Ecosystem Health Score.
 *
 * A transparent, weighted 0–100 score that ranks ecosystems by *developer
 * health* rather than market cap. Every component is normalized *relative to
 * the tracked set* (min–max, on a log scale for skewed count metrics) so the
 * score answers "how does this ecosystem compare to its ZK peers today".
 *
 * The math is intentionally simple and pure so it can be unit-tested and the
 * breakdown shown to users — no black box.
 */

export const HEALTH_WEIGHTS = {
  activity: 0.3, // commits (90d) + contributors
  momentum: 0.2, // recent releases + release recency
  community: 0.2, // stars + contributors
  maintenance: 0.15, // push recency + issue load
  breadth: 0.15, // repos + projects tracked
} as const;

export type HealthComponentKey = keyof typeof HEALTH_WEIGHTS;

export const HEALTH_COMPONENT_LABELS: Record<HealthComponentKey, string> = {
  activity: "Developer Activity",
  momentum: "Momentum",
  community: "Community",
  maintenance: "Maintenance",
  breadth: "Breadth",
};

export interface HealthBreakdown {
  /** 0–100 normalized sub-score per component. */
  components: Record<HealthComponentKey, number>;
  /** 0–100 final weighted score. */
  score: number;
}

export interface ScoredEcosystem {
  slug: string;
  metrics: EcosystemMetrics;
  health: HealthBreakdown;
}

// ---- normalization helpers ------------------------------------------------

/** Min–max normalize `value` within [min,max] to 0..1 (safe when min==max). */
function minMax(value: number, min: number, max: number): number {
  if (max <= min) return max === 0 ? 0 : 0.5;
  return clamp01((value - min) / (max - min));
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Freshness in 0..1: 1.0 today, decaying to ~0 over `halfLifeDays`. */
function recency(iso: string | null, halfLifeDays: number, now: number): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  const ageDays = Math.max(0, (now - t) / 86_400_000);
  return clamp01(Math.pow(0.5, ageDays / halfLifeDays));
}

const log1p = (n: number) => Math.log1p(Math.max(0, n));

// ---- core -----------------------------------------------------------------

/**
 * Compute health scores for the whole tracked set at once. Normalization is
 * relative, so scores are only meaningful when computed over the full set.
 *
 * @param now epoch millis "as of" time (injectable for deterministic tests).
 */
export function scoreEcosystems(
  input: { slug: string; metrics: EcosystemMetrics }[],
  now: number = Date.now(),
): ScoredEcosystem[] {
  if (input.length === 0) return [];

  // Pre-transform skewed count metrics to log space, then find set extremes.
  const rows = input.map(({ slug, metrics: m }) => ({
    slug,
    m,
    logCommits: log1p(m.commits90d),
    logContribs: log1p(m.contributors),
    logStars: log1p(m.stars),
    logBreadth: log1p(m.repoCount + m.projectCount),
    // Lower open-issue load is healthier; normalize issues-per-repo then invert.
    issueLoad: m.repoCount > 0 ? m.openIssues / m.repoCount : m.openIssues,
    relRecency: recency(m.lastReleaseAt, 60, now),
    pushRecency: recency(m.lastPushAt, 21, now),
    releaseCount: m.releasesLast90d,
  }));

  const ext = (sel: (r: (typeof rows)[number]) => number) => {
    const vals = rows.map(sel);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  };

  const eCommits = ext((r) => r.logCommits);
  const eContribs = ext((r) => r.logContribs);
  const eStars = ext((r) => r.logStars);
  const eBreadth = ext((r) => r.logBreadth);
  const eIssue = ext((r) => r.issueLoad);
  const eReleases = ext((r) => r.releaseCount);

  return rows.map((r) => {
    const activity =
      0.6 * minMax(r.logCommits, eCommits.min, eCommits.max) +
      0.4 * minMax(r.logContribs, eContribs.min, eContribs.max);

    const momentum =
      0.5 * minMax(r.releaseCount, eReleases.min, eReleases.max) +
      0.5 * r.relRecency;

    const community =
      0.6 * minMax(r.logStars, eStars.min, eStars.max) +
      0.4 * minMax(r.logContribs, eContribs.min, eContribs.max);

    // invert issue load: less load -> higher score
    const issueHealth = 1 - minMax(r.issueLoad, eIssue.min, eIssue.max);
    const maintenance = 0.6 * r.pushRecency + 0.4 * issueHealth;

    const breadth = minMax(r.logBreadth, eBreadth.min, eBreadth.max);

    const components: Record<HealthComponentKey, number> = {
      activity: to100(activity),
      momentum: to100(momentum),
      community: to100(community),
      maintenance: to100(maintenance),
      breadth: to100(breadth),
    };

    const score = to100(
      HEALTH_WEIGHTS.activity * activity +
        HEALTH_WEIGHTS.momentum * momentum +
        HEALTH_WEIGHTS.community * community +
        HEALTH_WEIGHTS.maintenance * maintenance +
        HEALTH_WEIGHTS.breadth * breadth,
    );

    return { slug: r.slug, metrics: r.m, health: { components, score } };
  });
}

function to100(n: number): number {
  return Math.round(clamp01(n) * 100);
}

/** Qualitative band + semantic color token for a 0–100 score. */
export function healthBand(score: number): {
  label: string;
  token: "success" | "warning" | "danger";
} {
  if (score >= 70) return { label: "Thriving", token: "success" };
  if (score >= 45) return { label: "Healthy", token: "success" };
  if (score >= 25) return { label: "Developing", token: "warning" };
  return { label: "Early", token: "danger" };
}
