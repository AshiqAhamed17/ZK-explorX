import { healthBand } from "@/lib/health";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TOKEN_TEXT: Record<"success" | "warning" | "danger", string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/** Instrument gauge rendering a 0–100 health score with tick marks. */
export function HealthRing({
  score,
  size = 148,
  strokeWidth = 8,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const band = healthBand(score);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  // 40 tick marks around the dial; ticks below the score read "lit".
  const ticks = Array.from({ length: 40 }, (_, i) => i);
  const tickOuter = size / 2 - 1;
  const tickInner = size / 2 - 5;

  return (
    <div
      className={cn("relative shrink-0", TOKEN_TEXT[band.token])}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {ticks.map((i) => {
          const angle = (i / ticks.length) * 2 * Math.PI;
          const lit = i / ticks.length <= score / 100;
          return (
            <line
              key={i}
              x1={cx + tickInner * Math.cos(angle)}
              y1={cy + tickInner * Math.sin(angle)}
              x2={cx + tickOuter * Math.cos(angle)}
              y2={cy + tickOuter * Math.sin(angle)}
              stroke={lit ? "currentColor" : "var(--border)"}
              strokeWidth={1.25}
              opacity={lit ? 0.9 : 1}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={cx}
          cy={cy}
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
        <span className="font-data text-[2.1rem] font-semibold leading-none text-foreground">
          {score}
        </span>
        <span className="font-data mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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
    <Badge variant={band.token} className="gap-1.5">
      <span className="font-data font-semibold">{score}</span>
      <span className="opacity-50">·</span>
      {band.label}
    </Badge>
  );
}
