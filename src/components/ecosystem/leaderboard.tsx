"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { RankedEcosystem } from "@/lib/ecosystems";
import { CATEGORY_LABELS } from "@/data/schema";
import { ecoVar } from "@/lib/colors";
import { healthBand } from "@/lib/health";
import { cn, formatCompact, formatUsd } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

type SortKey = "health" | "adoption" | "stars" | "commits" | "tvl";

const COLS =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_4.5rem] items-center gap-3 md:grid-cols-[2rem_minmax(0,1fr)_5rem_5rem_5rem_6rem_6.5rem] md:gap-4";

const TOKEN_TEXT: Record<"success" | "warning" | "danger", string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function value(r: RankedEcosystem, key: SortKey): number {
  switch (key) {
    case "health":
      return r.health.score;
    case "adoption":
      return r.adoption ?? -1;
    case "stars":
      return r.metrics.stars;
    case "commits":
      return r.metrics.commits90d;
    case "tvl":
      return r.tvl?.current ?? -1;
  }
}

function HeaderCell({
  label,
  col,
  sortKey,
  setSortKey,
  className,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === col;
  return (
    <button
      type="button"
      onClick={() => setSortKey(col)}
      className={cn(
        "flex items-center gap-1 font-data text-[10px] uppercase tracking-wider transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      {label}
      <ArrowDown className={cn("size-3 transition-opacity", active ? "opacity-100" : "opacity-0")} />
    </button>
  );
}

/** Sortable, identity-colored data table of all tracked ecosystems. */
export function Leaderboard({ ranked }: { ranked: RankedEcosystem[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("health");

  const rows = useMemo(
    () => [...ranked].sort((a, b) => value(b, sortKey) - value(a, sortKey)),
    [ranked, sortKey],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className={cn(
          COLS,
          "border-b border-border bg-secondary/40 px-4 py-2.5 text-[10px] font-medium text-muted-foreground",
        )}
      >
        <div className="font-data">#</div>
        <div className="font-data uppercase tracking-wider">Ecosystem</div>
        <HeaderCell label="Health" col="health" sortKey={sortKey} setSortKey={setSortKey} className="justify-self-end md:justify-self-start" />
        <HeaderCell label="Adopt." col="adoption" sortKey={sortKey} setSortKey={setSortKey} className="hidden justify-self-end md:flex" />
        <HeaderCell label="Stars" col="stars" sortKey={sortKey} setSortKey={setSortKey} className="hidden justify-self-end md:flex" />
        <HeaderCell label="90d" col="commits" sortKey={sortKey} setSortKey={setSortKey} className="hidden justify-self-end md:flex" />
        <HeaderCell label="TVL" col="tvl" sortKey={sortKey} setSortKey={setSortKey} className="hidden justify-self-end md:flex" />
        <div className="hidden justify-self-end font-data uppercase tracking-wider md:block">Trend</div>
      </div>

      {rows.map((r, i) => {
        const { ecosystem: e, metrics, health } = r;
        const color = ecoVar(e.slug);
        const band = healthBand(health.score);
        return (
          <Link
            key={e.slug}
            href={`/ecosystems/${e.slug}`}
            className={cn(COLS, "border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-secondary/40")}
          >
            <div className="font-data text-sm text-muted-foreground">{i + 1}</div>

            <div className="flex min-w-0 items-center gap-3">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-base" style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                {e.glyph}
              </span>
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-medium">{e.name}</div>
                <div className="truncate text-xs text-muted-foreground">{CATEGORY_LABELS[e.category]}</div>
              </div>
            </div>

            {/* Every value below is live-fetched (GitHub/DefiLlama) and can
                legitimately tick between the server render and hydration —
                suppressHydrationWarning is React's documented escape hatch
                for exactly that, not a blanket mismatch suppressor. */}
            <div
              className={cn("justify-self-end font-data text-sm font-semibold md:justify-self-start", TOKEN_TEXT[band.token])}
              suppressHydrationWarning
            >
              {health.score}
            </div>
            <div className="hidden justify-self-end font-data text-sm text-muted-foreground md:block" suppressHydrationWarning>
              {r.adoption ?? "—"}
            </div>
            <div className="hidden justify-self-end font-data text-sm md:block" suppressHydrationWarning>
              {formatCompact(metrics.stars)}
            </div>
            <div className="hidden justify-self-end font-data text-sm text-muted-foreground md:block" suppressHydrationWarning>
              {formatCompact(metrics.commits90d)}
            </div>
            <div className="hidden justify-self-end font-data text-sm md:block" suppressHydrationWarning>
              {r.tvl ? formatUsd(r.tvl.current) : <span className="text-muted-foreground">—</span>}
            </div>
            <div className="hidden w-24 justify-self-end md:block">
              <Sparkline data={metrics.weeklyCommits} color={color} height={26} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
