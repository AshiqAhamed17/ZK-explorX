import { describe, expect, it } from "vitest";
import { healthBand, scoreEcosystems } from "./health";
import { emptyMetrics, type EcosystemMetrics } from "@/types/metrics";

const NOW = new Date("2026-07-16T00:00:00Z").getTime();
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString();

function metrics(overrides: Partial<EcosystemMetrics>): EcosystemMetrics {
  return { ...emptyMetrics(1, 0), partial: false, ...overrides };
}

const thriving = metrics({
  stars: 20_000,
  forks: 3_000,
  contributors: 500,
  commits90d: 4_000,
  releasesLast90d: 12,
  lastReleaseAt: daysAgo(3),
  lastPushAt: daysAgo(1),
  openIssues: 200,
  repoCount: 4,
  projectCount: 12,
});

const middling = metrics({
  stars: 2_000,
  forks: 300,
  contributors: 60,
  commits90d: 400,
  releasesLast90d: 3,
  lastReleaseAt: daysAgo(40),
  lastPushAt: daysAgo(14),
  openIssues: 120,
  repoCount: 2,
  projectCount: 4,
});

const dormant = metrics({
  stars: 150,
  forks: 20,
  contributors: 5,
  commits90d: 3,
  releasesLast90d: 0,
  lastReleaseAt: daysAgo(500),
  lastPushAt: daysAgo(300),
  openIssues: 300,
  repoCount: 1,
  projectCount: 0,
});

describe("scoreEcosystems", () => {
  it("returns an empty array for empty input", () => {
    expect(scoreEcosystems([], NOW)).toEqual([]);
  });

  it("keeps all scores and components within 0..100", () => {
    const scored = scoreEcosystems(
      [
        { slug: "a", metrics: thriving },
        { slug: "b", metrics: middling },
        { slug: "c", metrics: dormant },
      ],
      NOW,
    );
    for (const s of scored) {
      expect(s.health.score).toBeGreaterThanOrEqual(0);
      expect(s.health.score).toBeLessThanOrEqual(100);
      for (const v of Object.values(s.health.components)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it("ranks a thriving ecosystem above a middling one above a dormant one", () => {
    const scored = scoreEcosystems(
      [
        { slug: "dormant", metrics: dormant },
        { slug: "thriving", metrics: thriving },
        { slug: "middling", metrics: middling },
      ],
      NOW,
    );
    const bySlug = Object.fromEntries(scored.map((s) => [s.slug, s.health.score]));
    expect(bySlug.thriving).toBeGreaterThan(bySlug.middling);
    expect(bySlug.middling).toBeGreaterThan(bySlug.dormant);
  });

  it("rewards recent releases in the momentum component", () => {
    const stale = { ...thriving, lastReleaseAt: daysAgo(400), releasesLast90d: 0 };
    const scored = scoreEcosystems(
      [
        { slug: "fresh", metrics: thriving },
        { slug: "stale", metrics: stale },
      ],
      NOW,
    );
    const bySlug = Object.fromEntries(
      scored.map((s) => [s.slug, s.health.components.momentum]),
    );
    expect(bySlug.fresh).toBeGreaterThan(bySlug.stale);
  });

  it("is deterministic given a fixed `now`", () => {
    const input = [
      { slug: "a", metrics: thriving },
      { slug: "b", metrics: dormant },
    ];
    expect(scoreEcosystems(input, NOW)).toEqual(scoreEcosystems(input, NOW));
  });
});

describe("healthBand", () => {
  it("maps scores to sensible qualitative bands", () => {
    expect(healthBand(85).token).toBe("success");
    expect(healthBand(50).label).toBe("Healthy");
    expect(healthBand(30).token).toBe("warning");
    expect(healthBand(10).token).toBe("danger");
  });
});
