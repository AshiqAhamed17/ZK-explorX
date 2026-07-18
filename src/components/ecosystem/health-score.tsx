import { healthBand } from "@/lib/health";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TOKEN_TEXT: Record<"success" | "warning" | "danger", string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/** Circular gauge rendering a 0–100 health score. */
export function HealthRing({
  score,
  size = 132,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const band = healthBand(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div
      className={cn("relative shrink-0", TOKEN_TEXT[band.token])}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-foreground">
          {score}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          Health
        </span>
      </div>
    </div>
  );
}

/** Compact pill showing the score number and qualitative band. */
export function HealthBadge({ score }: { score: number }) {
  const band = healthBand(score);
  return (
    <Badge variant={band.token} className="tabular-nums">
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">·</span>
      {band.label}
    </Badge>
  );
}
