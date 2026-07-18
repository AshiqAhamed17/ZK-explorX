"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface LineSeries {
  name: string;
  color: string;
  data: number[];
}

/**
 * Overlay several numeric series on a shared index axis (e.g. weekly commits
 * per ecosystem). Series are right-aligned to the longest so recent weeks line
 * up. One y-scale only — never dual-axis.
 */
export function MultiLineChart({
  series,
  weeks = 26,
  height = 240,
  yLabel,
  unit = "w",
}: {
  series: LineSeries[];
  weeks?: number;
  height?: number;
  yLabel?: string;
  unit?: string;
}) {
  const sliced = series.map((s) => ({ ...s, data: s.data.slice(-weeks) }));
  const len = Math.max(0, ...sliced.map((s) => s.data.length));

  const data = Array.from({ length: len }, (_, i) => {
    const ago = len - 1 - i;
    const row: Record<string, string | number> = {
      label: ago === 0 ? "now" : `-${ago}${unit}`,
    };
    sliced.forEach((s) => {
      const offset = len - s.data.length;
      const v = i - offset;
      if (v >= 0) row[s.name] = s.data[v];
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={40}
          allowDecimals={false}
          label={
            yLabel
              ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted-foreground)" }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        {sliced.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
