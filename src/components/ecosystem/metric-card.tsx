import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  hint?: string;
  accent?: string;
  className?: string;
}

/** Small KPI tile used across the ecosystem dashboard. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <div
        className="font-data text-2xl font-semibold leading-none"
        style={accent ? { color: accent } : undefined}
        // `value` is sometimes a relative-time string (`timeAgo`) computed
        // from `Date.now()` — it can legitimately differ by a unit between
        // SSG build time and client hydration. Harmless no-op for every
        // other (non-time) value shown in this card.
        suppressHydrationWarning
      >
        {value}
      </div>
      {hint ? (
        <div className="text-xs text-muted-foreground/70">{hint}</div>
      ) : null}
    </div>
  );
}
