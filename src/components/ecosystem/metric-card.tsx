import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  hint?: string;
  className?: string;
}

/** Small KPI tile used across the ecosystem dashboard. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? (
        <div className="text-xs text-muted-foreground/70">{hint}</div>
      ) : null}
    </div>
  );
}
