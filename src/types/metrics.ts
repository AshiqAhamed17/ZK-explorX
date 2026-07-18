/**
 * Live, quantitative signals aggregated across an ecosystem's curated repos.
 * Produced by the GitHub layer (`src/lib/github.ts`) and consumed by the
 * health-score engine (`src/lib/health.ts`) and the UI.
 *
 * All fields are best-effort: any individual GitHub call can fail or be
 * rate-limited, so numeric fields fall back to 0 and dates to null rather
 * than throwing. `partial` flags that at least one signal was degraded.
 */
export interface EcosystemMetrics {
  /** Sum of stargazers across all curated repos. */
  stars: number;
  /** Sum of forks across all curated repos. */
  forks: number;
  /** Approx. total contributors across all curated repos. */
  contributors: number;
  /** Commits in the trailing ~90 days (last 13 weeks), summed over repos. */
  commits90d: number;
  /** Element-wise weekly commit totals over the last 52 weeks (sparkline). */
  weeklyCommits: number[];
  /** GitHub releases published in the trailing ~90 days, summed over repos. */
  releasesLast90d: number;
  /** ISO timestamp of the most recent release across repos, or null. */
  lastReleaseAt: string | null;
  /** ISO timestamp of the most recent push across repos, or null. */
  lastPushAt: string | null;
  /** Sum of open issues (GitHub counts PRs here too — used as a proxy). */
  openIssues: number;
  /** Number of curated repos tracked for this ecosystem. */
  repoCount: number;
  /** Number of curated projects listed for this ecosystem. */
  projectCount: number;
  /** True if any underlying GitHub call failed and was defaulted. */
  partial: boolean;
}

/** Zeroed metrics used as a safe fallback when GitHub is unavailable. */
export function emptyMetrics(repoCount = 0, projectCount = 0): EcosystemMetrics {
  return {
    stars: 0,
    forks: 0,
    contributors: 0,
    commits90d: 0,
    weeklyCommits: [],
    releasesLast90d: 0,
    lastReleaseAt: null,
    lastPushAt: null,
    openIssues: 0,
    repoCount,
    projectCount,
    partial: true,
  };
}
