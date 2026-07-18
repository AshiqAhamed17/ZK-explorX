"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TvlPoint } from "@/types/metrics";
import { formatUsd } from "@/lib/utils";

function TvlTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { date: number; tvl: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const date = new Date(d.date * 1000).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-data font-semibold">{formatUsd(d.tvl)}</div>
      <div className="font-data text-muted-foreground">{date}</div>
    </div>
  );
}

/** Total-value-locked trend (daily) for a single chain. */
export function TvlAreaChart({
  history,
  color = "var(--primary)",
  height = 200,
}: {
  history: TvlPoint[];
  color?: string;
  height?: number;
}) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        No TVL data available.
      </div>
    );
  }
  const id = `tvl-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={history} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v: number) => formatUsd(v).replace("$", "")}
        />
        <Tooltip content={<TvlTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Area
          type="monotone"
          dataKey="tvl"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
