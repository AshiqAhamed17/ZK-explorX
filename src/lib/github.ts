import type { RepoRef } from "@/data/schema";
import { emptyMetrics, type EcosystemMetrics } from "@/types/metrics";

/**
 * GitHub live-data layer.
 *
 * Calls the GitHub REST API with the *native* `fetch` so we get Next.js's
 * built-in time-based caching (ISR) for free — every response is cached and
 * revalidated on the interval below. Set `GITHUB_TOKEN` to lift the rate
 * limit from 60/hr (anonymous) to 5000/hr.
 *
 * Design choices for reliability:
 *  - Core counts (stars, forks, issues, commits, contributors, releases) come
 *    from stable endpoints. Commit and contributor *totals* are read from the
 *    `Link: rel="last"` pagination header (one cheap request each) rather than
 *    the flaky `/stats/*` endpoints.
 *  - The weekly-commit sparkline is best-effort from `/stats/commit_activity`
 *    (which returns 202 while GitHub computes it); on miss we degrade to an
 *    empty sparkline and flag the metrics `partial` — never throw.
 */

const GH_API = "https://api.github.com";
const REVALIDATE_SECONDS = 21_600; // 6 hours
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
/** Cap concurrent GitHub requests per ecosystem aggregation. */
const CONCURRENCY = 6;
/** Global ceiling on in-flight GitHub requests, across all callers in this
 *  process — keeps us well under GitHub's secondary (concurrent) rate limit. */
const MAX_INFLIGHT = 8;
/** Fail a single request fast so a slow/throttled call degrades to partial
 *  data instead of hanging a page render (or the static build) past its limit. */
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "zk-explorx",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

// --- global semaphore ------------------------------------------------------
let inFlight = 0;
const waiters: (() => void)[] = [];

async function acquireSlot(): Promise<void> {
  while (inFlight >= MAX_INFLIGHT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  inFlight++;
}

function releaseSlot(): void {
  inFlight--;
  waiters.shift()?.();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a GitHub API path with global concurrency limiting and retry/backoff
 * on rate-limit (403/429) and server (5xx) responses, honoring `Retry-After`.
 * Throws after exhausting retries; callers catch and degrade to fallbacks.
 */
async function ghFetch(path: string): Promise<Response> {
  await acquireSlot();
  try {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(`${GH_API}${path}`, {
          headers: headers(),
          next: { revalidate: REVALIDATE_SECONDS },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (res.status === 403 || res.status === 429 || res.status >= 500) {
          const retryAfter = Number(res.headers.get("retry-after"));
          const backoff = Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 5_000)
            : 400 * (attempt + 1) + Math.floor(Math.random() * 300);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(backoff);
            continue;
          }
        }
        return res;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES - 1) {
          await sleep(400 * (attempt + 1) + Math.floor(Math.random() * 300));
        }
      }
    }
    throw lastError ?? new Error(`GitHub request failed: ${path}`);
  } finally {
    releaseSlot();
  }
}

/** Parse the total item count from a paginated response's Link header. */
function lastPageCount(res: Response, itemsOnPage: number): number {
  const link = res.headers.get("link");
  if (!link) return itemsOnPage; // 0 or 1 items, no pagination
  const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : itemsOnPage;
}

interface RepoCore {
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  ok: boolean;
}

async function fetchRepoCore(owner: string, repo: string): Promise<RepoCore> {
  try {
    const res = await ghFetch(`/repos/${owner}/${repo}`);
    if (!res.ok) return { stars: 0, forks: 0, openIssues: 0, pushedAt: null, ok: false };
    const j = await res.json();
    return {
      stars: j.stargazers_count ?? 0,
      forks: j.forks_count ?? 0,
      openIssues: j.open_issues_count ?? 0,
      pushedAt: j.pushed_at ?? null,
      ok: true,
    };
  } catch {
    return { stars: 0, forks: 0, openIssues: 0, pushedAt: null, ok: false };
  }
}

/** Total contributor count via the Link header (1 request, includes anon). */
async function fetchContributorCount(owner: string, repo: string): Promise<number | null> {
  try {
    const res = await ghFetch(`/repos/${owner}/${repo}/contributors?per_page=1&anon=true`);
    if (!res.ok) return null;
    const body = (await res.json()) as unknown[];
    return lastPageCount(res, Array.isArray(body) ? body.length : 0);
  } catch {
    return null;
  }
}

/** Commit count in the trailing ~90 days via the Link header (1 request). */
async function fetchCommits90d(owner: string, repo: string, sinceISO: string): Promise<number | null> {
  try {
    const res = await ghFetch(`/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=1`);
    if (!res.ok) return null;
    const body = (await res.json()) as unknown[];
    return lastPageCount(res, Array.isArray(body) ? body.length : 0);
  } catch {
    return null;
  }
}

interface ReleaseInfo {
  last90d: number;
  lastReleaseAt: string | null;
  ok: boolean;
}

async function fetchReleases(owner: string, repo: string, cutoff: number): Promise<ReleaseInfo> {
  try {
    // Releases come back newest-first. We only need the latest date and a
    // recent count, so cap the page: full release bodies can exceed Next's
    // 2MB data-cache limit on repos with hundreds of (nightly) releases.
    const res = await ghFetch(`/repos/${owner}/${repo}/releases?per_page=30`);
    if (!res.ok) return { last90d: 0, lastReleaseAt: null, ok: false };
    const body = (await res.json()) as { published_at: string | null }[];
    let last90d = 0;
    let lastReleaseAt: string | null = null;
    for (const r of body) {
      if (!r.published_at) continue;
      const t = new Date(r.published_at).getTime();
      if (t >= cutoff) last90d++;
      if (!lastReleaseAt || t > new Date(lastReleaseAt).getTime()) lastReleaseAt = r.published_at;
    }
    return { last90d, lastReleaseAt, ok: true };
  } catch {
    return { last90d: 0, lastReleaseAt: null, ok: false };
  }
}

/** Best-effort weekly commit totals (last 52 weeks) for the sparkline. */
async function fetchWeeklyCommits(owner: string, repo: string): Promise<number[] | null> {
  try {
    const res = await ghFetch(`/repos/${owner}/${repo}/stats/commit_activity`);
    if (res.status === 202 || !res.ok) return null; // still computing / unavailable
    const body = (await res.json()) as { total: number }[];
    if (!Array.isArray(body)) return null;
    return body.map((w) => w.total ?? 0);
  } catch {
    return null;
  }
}

interface RepoMetrics {
  stars: number;
  forks: number;
  contributors: number;
  commits90d: number;
  releasesLast90d: number;
  lastReleaseAt: string | null;
  pushedAt: string | null;
  openIssues: number;
  weekly: number[] | null;
  ok: boolean;
}

async function fetchRepoMetrics(ref: RepoRef): Promise<RepoMetrics> {
  const sinceISO = new Date(Date.now() - NINETY_DAYS_MS).toISOString();
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const [core, contributors, commits90d, releases, weekly] = await Promise.all([
    fetchRepoCore(ref.owner, ref.repo),
    fetchContributorCount(ref.owner, ref.repo),
    fetchCommits90d(ref.owner, ref.repo, sinceISO),
    fetchReleases(ref.owner, ref.repo, cutoff),
    fetchWeeklyCommits(ref.owner, ref.repo),
  ]);
  const ok = core.ok && contributors !== null && commits90d !== null && releases.ok;
  return {
    stars: core.stars,
    forks: core.forks,
    contributors: contributors ?? 0,
    commits90d: commits90d ?? 0,
    releasesLast90d: releases.last90d,
    lastReleaseAt: releases.lastReleaseAt,
    pushedAt: core.pushedAt,
    openIssues: core.openIssues,
    weekly,
    ok,
  };
}

/** Run async tasks with a bounded concurrency limit. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Element-wise sum of weekly-commit arrays, right-aligned to the longest. */
function sumWeekly(series: (number[] | null)[]): number[] {
  const valid = series.filter((s): s is number[] => Array.isArray(s) && s.length > 0);
  if (valid.length === 0) return [];
  const len = Math.max(...valid.map((s) => s.length));
  const out = new Array(len).fill(0);
  for (const s of valid) {
    const offset = len - s.length;
    for (let i = 0; i < s.length; i++) out[offset + i] += s[i];
  }
  return out;
}

/** Aggregate live metrics for one ecosystem across its curated repos. */
export async function getEcosystemMetrics(
  repos: RepoRef[],
  projectCount: number,
): Promise<EcosystemMetrics> {
  if (repos.length === 0) return emptyMetrics(0, projectCount);

  const perRepo = await mapLimit(repos, CONCURRENCY, fetchRepoMetrics);

  const agg = emptyMetrics(repos.length, projectCount);
  let anyFailure = false;
  const weeklySeries: (number[] | null)[] = [];

  for (const r of perRepo) {
    agg.stars += r.stars;
    agg.forks += r.forks;
    agg.contributors += r.contributors;
    agg.commits90d += r.commits90d;
    agg.releasesLast90d += r.releasesLast90d;
    agg.openIssues += r.openIssues;
    weeklySeries.push(r.weekly);
    if (r.lastReleaseAt && (!agg.lastReleaseAt || r.lastReleaseAt > agg.lastReleaseAt)) {
      agg.lastReleaseAt = r.lastReleaseAt;
    }
    if (r.pushedAt && (!agg.lastPushAt || r.pushedAt > agg.lastPushAt)) {
      agg.lastPushAt = r.pushedAt;
    }
    if (!r.ok) anyFailure = true;
  }

  agg.weeklyCommits = sumWeekly(weeklySeries);
  agg.partial = anyFailure;
  return agg;
}

export interface RepoCoreStat extends RepoRef {
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  ok: boolean;
}

/** Per-repo core stats for the "Key repositories" list (reuses cached calls). */
export async function getReposCore(repos: RepoRef[]): Promise<RepoCoreStat[]> {
  return mapLimit(repos, CONCURRENCY, async (r) => {
    const core = await fetchRepoCore(r.owner, r.repo);
    return { ...r, ...core };
  });
}

/** Fetch metrics for many ecosystems in parallel, keyed by slug. */
export async function getMetricsBySlug(
  ecosystems: { slug: string; repos: RepoRef[]; projectCount: number }[],
): Promise<Record<string, EcosystemMetrics>> {
  const entries = await Promise.all(
    ecosystems.map(async (e) => [e.slug, await getEcosystemMetrics(e.repos, e.projectCount)] as const),
  );
  return Object.fromEntries(entries);
}
