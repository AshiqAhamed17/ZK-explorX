"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HealthHistoryPoint } from "@/lib/metrics/history";

const MIN_POINTS_FOR_CHART = 5;

function HistoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: HealthHistoryPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const date = new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-data font-semibold">{d.healthScore}</div>
      <div className="font-data text-muted-foreground">{date}</div>
    </div>
  );
}

/**
 * Daily health-score trend, backed by the cron-populated `ecosystem_snapshots`
 * table. A handful of days of real data is needed before a line is
 * meaningful, so this renders an honest "collecting history" state below
 * that threshold rather than a misleadingly sparse chart or fabricated
 * backdated points.
 */
export function HistoryLineChart({
  history,
  color = "var(--primary)",
  height = 200,
}: {
  history: HealthHistoryPoint[];
  color?: string;
  height?: number;
}) {
  if (history.length < MIN_POINTS_FOR_CHART) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
        <span>Collecting history…</span>
        <span className="font-data text-xs text-muted-foreground/70">
          {history.length === 0
            ? "Check back after the first few daily snapshots."
            : `${history.length} of ${MIN_POINTS_FOR_CHART} days recorded so far.`}
        </span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={history} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
        <XAxis dataKey="date" hide />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<HistoryTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Line
          type="monotone"
          dataKey="healthScore"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
