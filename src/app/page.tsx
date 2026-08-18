import Link from "next/link";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { getRankedEcosystems } from "@/lib/ecosystems";
import { formatCompact, formatUsd } from "@/lib/utils";
import { Leaderboard } from "@/components/ecosystem/leaderboard";

export const revalidate = 21600; // 6 hours

export default async function HomePage() {
  const ranked = await getRankedEcosystems();

  const totalStars = ranked.reduce((s, r) => s + r.metrics.stars, 0);
  const totalCommits = ranked.reduce((s, r) => s + r.metrics.commits90d, 0);
  const totalContributors = ranked.reduce((s, r) => s + r.metrics.contributors, 0);
  const totalTvl = ranked.reduce((s, r) => s + (r.tvl?.current ?? 0), 0);

  const index: { label: string; value: string }[] = [
    { label: "Ecosystems", value: String(ranked.length) },
    { label: "Stars", value: formatCompact(totalStars) },
    { label: "Commits / 90d", value: formatCompact(totalCommits) },
    { label: "Contributors", value: formatCompact(totalContributors) },
    { label: "Tracked TVL", value: formatUsd(totalTvl) },
  ];

  return (
    <div>
      {/* Hero — lead with the data */}
      <section className="relative border-b border-border">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="font-data inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Developer health, not market cap
          </div>
          <h1 className="font-display mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            The instrument panel for the Zero-Knowledge ecosystem.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Live GitHub activity, on-chain adoption, and a transparent health
            score for every major ZK network — read the ecosystem the way its
            engineers do.
          </p>

          {/* ZK Index strip */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {index.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 bg-card px-4 py-4">
                <dt className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </dt>
                {/* Most of these are aggregated live GitHub/DefiLlama data
                    -- can legitimately tick between server render and
                    hydration. */}
                <dd className="font-data text-2xl font-semibold" suppressHydrationWarning>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/ecosystems"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse ecosystems
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <GitCompareArrows className="size-4" />
              Compare
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Health Leaderboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by a transparent, weighted score. Tap a column to re-sort.
            </p>
          </div>
          <Link
            href="/about"
            className="hidden shrink-0 items-center gap-1 text-sm text-primary hover:underline sm:flex"
          >
            Methodology
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-5">
          <Leaderboard ranked={ranked} />
        </div>
      </section>
    </div>
  );
}
