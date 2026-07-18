import Link from "next/link";
import { GitCommitHorizontal, Star } from "lucide-react";
import type { RankedEcosystem } from "@/lib/ecosystems";
import { CATEGORY_LABELS } from "@/data/schema";
import { formatCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/ecosystem/health-score";
import { Sparkline } from "@/components/charts/sparkline";

export function EcosystemCard({ ranked }: { ranked: RankedEcosystem }) {
  const { ecosystem: e, metrics, health } = ranked;
  return (
    <Link
      href={`/ecosystems/${e.slug}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: `${e.brandColor}22` }}
          >
            {e.glyph}
          </span>
          <div>
            <div className="font-semibold leading-tight">{e.name}</div>
            <Badge variant="outline" className="mt-1">
              {CATEGORY_LABELS[e.category]}
            </Badge>
          </div>
        </div>
        <HealthBadge score={health.score} />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{e.tagline}</p>

      <div className="-mx-1">
        <Sparkline data={metrics.weeklyCommits} color={e.brandColor} height={36} />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3.5" />
          {formatCompact(metrics.stars)}
        </span>
        <span className="flex items-center gap-1">
          <GitCommitHorizontal className="size-3.5" />
          {formatCompact(metrics.commits90d)} <span className="opacity-70">/ 90d</span>
        </span>
        <span className="ml-auto text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Explore →
        </span>
      </div>
    </Link>
  );
}
