"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

/** Minimal, axis-less trend line for weekly commit activity. */
export function Sparkline({
  data,
  color = "var(--primary)",
  height = 32,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center text-[10px] text-muted-foreground/60"
      >
        no data
      </div>
    );
  }
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  const chartData = data.map((total, week) => ({ week, total }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="total"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
