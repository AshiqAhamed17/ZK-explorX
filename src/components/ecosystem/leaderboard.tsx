import Link from "next/link";
import type { RankedEcosystem } from "@/lib/ecosystems";
import { CATEGORY_LABELS } from "@/data/schema";
import { formatCompact } from "@/lib/utils";
import { HealthBadge } from "@/components/ecosystem/health-score";
import { Sparkline } from "@/components/charts/sparkline";

const COLS =
  "grid grid-cols-[2rem_1fr_auto] items-center gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5rem_5rem_7rem]";

/** Health-ranked leaderboard of all tracked ecosystems. */
export function Leaderboard({ ranked }: { ranked: RankedEcosystem[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* header */}
      <div
        className={`${COLS} border-b border-border bg-secondary/40 px-4 py-2.5 text-xs font-medium text-muted-foreground`}
      >
        <div>#</div>
        <div>Ecosystem</div>
        <div className="hidden sm:block">Health</div>
        <div className="hidden justify-self-end sm:block">Stars</div>
        <div className="hidden justify-self-end sm:block">90d</div>
        <div className="justify-self-end sm:hidden">Health</div>
        <div className="hidden justify-self-end sm:block">Trend</div>
      </div>

      {ranked.map((r) => {
        const { ecosystem: e, metrics, health, rank } = r;
        return (
          <Link
            key={e.slug}
            href={`/ecosystems/${e.slug}`}
            className={`${COLS} border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-secondary/40`}
          >
            <div className="text-sm font-medium tabular-nums text-muted-foreground">
              {rank}
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: `${e.brandColor}22` }}
              >
                {e.glyph}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{e.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {CATEGORY_LABELS[e.category]}
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <HealthBadge score={health.score} />
            </div>
            <div className="hidden justify-self-end text-sm tabular-nums sm:block">
              {formatCompact(metrics.stars)}
            </div>
            <div className="hidden justify-self-end text-sm tabular-nums text-muted-foreground sm:block">
              {formatCompact(metrics.commits90d)}
            </div>

            {/* mobile: just the health badge */}
            <div className="justify-self-end sm:hidden">
              <HealthBadge score={health.score} />
            </div>

            <div className="hidden w-28 justify-self-end sm:block">
              <Sparkline data={metrics.weeklyCommits} color={e.brandColor} height={28} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
