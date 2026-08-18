"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type { RankedEcosystem } from "@/lib/ecosystems";
import { ecoVar } from "@/lib/colors";
import { cn, formatCompact, formatNumber, formatUsd } from "@/lib/utils";
import { HealthRadar, type RadarSeries } from "@/components/charts/health-radar";
import { MultiLineChart, type LineSeries } from "@/components/charts/multi-line-chart";

const MAX = 3;

interface MetricRow {
  label: string;
  get: (r: RankedEcosystem) => number | undefined;
  format: (v: number) => string;
}

const ROWS: MetricRow[] = [
  { label: "Health score", get: (r) => r.health.score, format: (v) => String(v) },
  { label: "Adoption", get: (r) => r.adoption, format: (v) => String(v) },
  { label: "Stars", get: (r) => r.metrics.stars, format: formatCompact },
  { label: "Contributors", get: (r) => r.metrics.contributors, format: formatCompact },
  { label: "Commits / 90d", get: (r) => r.metrics.commits90d, format: formatCompact },
  { label: "Releases / 90d", get: (r) => r.metrics.releasesLast90d, format: formatNumber },
  { label: "Forks", get: (r) => r.metrics.forks, format: formatCompact },
  { label: "TVL", get: (r) => r.tvl?.current, format: formatUsd },
];

export function CompareTool({
  ranked,
  initialIds,
}: {
  ranked: RankedEcosystem[];
  initialIds: string[];
}) {
  const router = useRouter();
  const bySlug = useMemo(
    () => new Map(ranked.map((r) => [r.ecosystem.slug, r])),
    [ranked],
  );

  const seed = initialIds.filter((id) => bySlug.has(id)).slice(0, MAX);
  const [selected, setSelected] = useState<string[]>(
    seed.length ? seed : ranked.slice(0, 2).map((r) => r.ecosystem.slug),
  );

  const syncUrl = useCallback(
    (ids: string[]) => {
      const qs = ids.length ? `?ids=${ids.join(",")}` : "";
      router.replace(`/compare${qs}`, { scroll: false });
    },
    [router],
  );

  const toggle = useCallback(
    (slug: string) => {
      setSelected((prev) => {
        let next: string[];
        if (prev.includes(slug)) next = prev.filter((s) => s !== slug);
        else if (prev.length >= MAX) next = [...prev.slice(1), slug];
        else next = [...prev, slug];
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const chosen = selected.map((s) => bySlug.get(s)!).filter(Boolean);

  const radarSeries: RadarSeries[] = chosen.map((r) => ({
    name: r.ecosystem.name,
    color: ecoVar(r.ecosystem.slug),
    components: r.health.components,
  }));

  const commitSeries: LineSeries[] = chosen.map((r) => ({
    name: r.ecosystem.name,
    color: ecoVar(r.ecosystem.slug),
    data: r.metrics.weeklyCommits,
  }));

  const tvlChosen = chosen.filter((r) => r.tvl);
  const tvlSeries: LineSeries[] = tvlChosen.map((r) => ({
    name: r.ecosystem.name,
    color: ecoVar(r.ecosystem.slug),
    data: r.tvl!.history.map((p) => p.tvl),
  }));

  return (
    <div>
      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {ranked.map((r) => {
          const active = selected.includes(r.ecosystem.slug);
          const color = ecoVar(r.ecosystem.slug);
          return (
            <button
              key={r.ecosystem.slug}
              type="button"
              onClick={() => toggle(r.ecosystem.slug)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active ? "border-transparent text-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
              style={active ? { backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` } : undefined}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              {r.ecosystem.name}
              {active ? <Check className="size-3.5" /> : null}
            </button>
          );
        })}
      </div>
      <p className="font-data mt-2 text-xs text-muted-foreground">
        Select up to {MAX} ecosystems · {chosen.length} selected
      </p>

      {chosen.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Pick an ecosystem above to start comparing.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Legend chips */}
          <div className="flex flex-wrap gap-3">
            {chosen.map((r) => (
              <span key={r.ecosystem.slug} className="inline-flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: ecoVar(r.ecosystem.slug) }} aria-hidden />
                <Link href={`/ecosystems/${r.ecosystem.slug}`} className="hover:underline">
                  {r.ecosystem.name}
                </Link>
                <button type="button" onClick={() => toggle(r.ecosystem.slug)} aria-label={`Remove ${r.ecosystem.name}`}>
                  <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>

          {/* Metrics table + radar */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-4 py-2.5 text-left font-data text-[10px] uppercase tracking-wider text-muted-foreground">
                      Metric
                    </th>
                    {chosen.map((r) => (
                      <th key={r.ecosystem.slug} className="px-4 py-2.5 text-right font-display font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ backgroundColor: ecoVar(r.ecosystem.slug) }} aria-hidden />
                          {r.ecosystem.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => {
                    const vals = chosen.map((r) => row.get(r));
                    const best = Math.max(...vals.map((v) => v ?? -Infinity));
                    return (
                      <tr key={row.label} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                        {chosen.map((r, i) => {
                          const v = vals[i];
                          const isBest = v !== undefined && v === best && chosen.length > 1;
                          return (
                            <td
                              key={r.ecosystem.slug}
                              className={cn(
                                "px-4 py-2.5 text-right font-data",
                                isBest ? "font-semibold text-foreground" : "text-muted-foreground",
                              )}
                              // Live GitHub/DefiLlama data -- can legitimately
                              // tick between server render and hydration.
                              suppressHydrationWarning
                            >
                              {v === undefined ? "—" : row.format(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-medium">Health profile</h2>
              <p className="font-data mb-1 text-xs text-muted-foreground">5 components, normalized vs. peers</p>
              <HealthRadar series={radarSeries} height={280} />
            </div>
          </div>

          {/* Commit overlay */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-medium">Weekly commit activity</h2>
            <p className="font-data mb-3 text-xs text-muted-foreground">Last 26 weeks</p>
            <MultiLineChart series={commitSeries} weeks={26} />
          </div>

          {/* TVL overlay (rollups only) */}
          {tvlSeries.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-medium">TVL trend</h2>
              <p className="font-data mb-3 text-xs text-muted-foreground">
                Last 90 days · {tvlChosen.map((r) => r.ecosystem.name).join(", ")}
              </p>
              <MultiLineChart series={tvlSeries} weeks={90} unit="d" />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
