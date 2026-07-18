import {
  HEALTH_COMPONENT_LABELS,
  HEALTH_WEIGHTS,
  type HealthBreakdown as HealthBreakdownType,
  type HealthComponentKey,
} from "@/lib/health";

const ORDER: HealthComponentKey[] = [
  "activity",
  "momentum",
  "community",
  "maintenance",
  "breadth",
];

/** Transparent, weighted breakdown of the health score by component. */
export function HealthBreakdown({ health }: { health: HealthBreakdownType }) {
  return (
    <div className="flex flex-col gap-3.5">
      {ORDER.map((key) => {
        const value = health.components[key];
        const weight = Math.round(HEALTH_WEIGHTS[key] * 100);
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="flex items-center gap-1.5">
                {HEALTH_COMPONENT_LABELS[key]}
                <span className="text-xs text-muted-foreground/70">
                  {weight}%
                </span>
              </span>
              <span className="tabular-nums font-medium">{value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
