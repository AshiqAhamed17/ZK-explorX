"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  HEALTH_COMPONENT_LABELS,
  type HealthComponentKey,
} from "@/lib/health";

const ORDER: HealthComponentKey[] = [
  "activity",
  "momentum",
  "community",
  "maintenance",
  "breadth",
];

export interface RadarSeries {
  name: string;
  color: string;
  components: Record<HealthComponentKey, number>;
}

/** 5-axis radar of the health components; overlays 1–3 ecosystems. */
export function HealthRadar({
  series,
  height = 260,
}: {
  series: RadarSeries[];
  height?: number;
}) {
  const data = ORDER.map((key) => {
    const row: Record<string, string | number> = {
      axis: HEALTH_COMPONENT_LABELS[key],
    };
    series.forEach((s) => {
      row[s.name] = s.components[key];
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        {series.map((s) => (
          <Radar
            key={s.name}
            name={s.name}
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={series.length > 1 ? 0.12 : 0.2}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
