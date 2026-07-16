import Link from "next/link";
import { ArrowRight, GitCommitHorizontal, Layers, Star } from "lucide-react";
import { GitHubIcon } from "@/components/brand-icons";
import { getRankedEcosystems } from "@/lib/ecosystems";
import { formatCompact } from "@/lib/utils";
import { Leaderboard } from "@/components/ecosystem/leaderboard";

export const revalidate = 21600; // 6 hours

export default async function HomePage() {
  const ranked = await getRankedEcosystems();

  const totalStars = ranked.reduce((s, r) => s + r.metrics.stars, 0);
  const totalCommits = ranked.reduce((s, r) => s + r.metrics.commits90d, 0);
  const totalRepos = ranked.reduce((s, r) => s + r.metrics.repoCount, 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-grid border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Ranking by developer health, not market cap
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Explore the Zero-Knowledge ecosystem the way developers actually
            evaluate it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            ZK-explorX combines curated protocol research with live GitHub
            activity to answer the questions that matter: which ZK ecosystems
            are healthy, actively built, and worth your time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/ecosystems"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse ecosystems
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              How scoring works
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <Stat icon={Layers} value={String(ranked.length)} label="Ecosystems tracked" />
            <Stat icon={Star} value={formatCompact(totalStars)} label="Combined GitHub stars" />
            <Stat
              icon={GitCommitHorizontal}
              value={formatCompact(totalCommits)}
              label="Commits in last 90 days"
            />
            <Stat icon={GitHubIcon} value={String(totalRepos)} label="Core repositories" />
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Ecosystem Health Leaderboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by a transparent, weighted score across developer activity,
              momentum, community, maintenance, and breadth.
            </p>
          </div>
          <Link
            href="/ecosystems"
            className="hidden shrink-0 items-center gap-1 text-sm text-primary hover:underline sm:flex"
          >
            View all
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

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
