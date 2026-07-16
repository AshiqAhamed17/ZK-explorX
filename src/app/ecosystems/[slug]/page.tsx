import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleDot,
  Clock,
  GitCommitHorizontal,
  Layers,
  Package,
  Star,
  Users,
} from "lucide-react";
import { allSlugs, getEcosystem } from "@/data";
import { CATEGORY_LABELS } from "@/data/schema";
import { getRankedEcosystem } from "@/lib/ecosystems";
import { getReposCore } from "@/lib/github";
import { healthBand } from "@/lib/health";
import { formatCompact, formatNumber, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CommitActivityChart } from "@/components/charts/commit-activity-chart";
import { HealthBreakdown } from "@/components/ecosystem/health-breakdown";
import { HealthRing } from "@/components/ecosystem/health-score";
import { MetricCard } from "@/components/ecosystem/metric-card";
import { RepoCard } from "@/components/ecosystem/repo-card";
import { ResourceLinks } from "@/components/ecosystem/resource-links";
import { StatusBadge } from "@/components/ecosystem/status-badge";

export const revalidate = 21600; // 6 hours

export function generateStaticParams() {
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEcosystem(slug);
  if (!e) return { title: "Not found" };
  return {
    title: `${e.name} — ${CATEGORY_LABELS[e.category]}`,
    description: e.tagline,
    openGraph: { title: e.name, description: e.tagline },
  };
}

const BAND_TEXT: Record<"success" | "warning" | "danger", string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-border pl-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getEcosystem(slug);
  if (!e) notFound();

  const [ranked, repos] = await Promise.all([
    getRankedEcosystem(slug),
    getReposCore(e.repos),
  ]);
  if (!ranked) notFound();

  const { metrics, health, rank } = ranked;
  const band = healthBand(health.score);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/ecosystems"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All ecosystems
      </Link>

      {/* Header */}
      <section
        className="relative mt-4 overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${e.brandColor}18, transparent 60%)`,
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span
                className="flex size-14 items-center justify-center rounded-xl text-3xl"
                style={{ backgroundColor: `${e.brandColor}22` }}
              >
                {e.glyph}
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {e.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{CATEGORY_LABELS[e.category]}</Badge>
                  <StatusBadge status={e.status} />
                  {e.nativeToken ? (
                    <Badge variant="primary">${e.nativeToken}</Badge>
                  ) : (
                    <Badge variant="outline">No token</Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="max-w-2xl text-muted-foreground">{e.tagline}</p>
          </div>

          <div className="flex items-center gap-5">
            <HealthRing score={health.score} />
            <div className="flex flex-col gap-1 text-sm">
              <span className={`font-medium ${BAND_TEXT[band.token]}`}>
                {band.label}
              </span>
              <span className="text-muted-foreground">
                Rank #{rank} of {allSlugs.length}
              </span>
              {metrics.partial ? (
                <span className="text-xs text-warning">
                  Some live data unavailable
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3 lg:grid-cols-6">
        <FactItem label="Proof System" value={e.proofSystem} />
        <FactItem label="VM" value={e.vm} />
        <FactItem label="Languages" value={e.languages.join(", ")} />
        <FactItem label="Token" value={e.nativeToken ?? "None"} />
        <FactItem label="Foundation" value={e.foundation} />
        <FactItem label="Launched" value={String(e.launchYear)} />
      </dl>

      {/* Health dashboard */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Developer Health</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live signals from {metrics.repoCount} core{" "}
          {metrics.repoCount === 1 ? "repository" : "repositories"} on GitHub.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Stars" value={formatCompact(metrics.stars)} icon={Star} />
          <MetricCard
            label="Commits / 90d"
            value={formatCompact(metrics.commits90d)}
            icon={GitCommitHorizontal}
          />
          <MetricCard
            label="Contributors"
            value={formatCompact(metrics.contributors)}
            icon={Users}
          />
          <MetricCard
            label="Releases / 90d"
            value={formatNumber(metrics.releasesLast90d)}
            icon={Package}
          />
          <MetricCard
            label="Open Issues"
            value={formatCompact(metrics.openIssues)}
            icon={CircleDot}
          />
          <MetricCard
            label="Last Commit"
            value={timeAgo(metrics.lastPushAt)}
            icon={Clock}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h3 className="text-sm font-medium">Weekly commit activity</h3>
            <p className="mb-3 text-xs text-muted-foreground">Last 26 weeks</p>
            <CommitActivityChart weekly={metrics.weeklyCommits} color={e.brandColor} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium">Health breakdown</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Weighted, normalized vs. peers
            </p>
            <HealthBreakdown health={health} />
          </div>
        </div>
      </section>

      {/* Overview + Architecture */}
      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Layers className="size-4 text-primary" />
            Overview
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            {e.overview.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            {e.architecture.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground/70">
            Timeline: {e.launchTimeline}
          </p>
        </div>
      </section>

      {/* Key repositories */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Key repositories</h2>
        <div className="mt-3 flex flex-col gap-2">
          {repos.map((r) => (
            <RepoCard key={`${r.owner}/${r.repo}`} repo={r} />
          ))}
        </div>
      </section>

      {/* Projects */}
      {e.projects.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Projects & applications
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {e.projects.map((p) => (
              <div
                key={p.name}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="outline">{p.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-primary hover:underline"
                  >
                    Visit →
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Resources */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Resources</h2>
        <div className="mt-3">
          <ResourceLinks links={e.links} />
        </div>
      </section>
    </div>
  );
}
