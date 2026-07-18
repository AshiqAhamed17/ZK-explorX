"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Datum {
  label: string;
  commits: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Datum }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-data font-semibold">{d.commits} commits</div>
      <div className="font-data text-muted-foreground">{d.label}</div>
    </div>
  );
}

/** Weekly commit-volume bar chart for the last ~26 weeks. */
export function CommitActivityChart({
  weekly,
  color = "var(--primary)",
}: {
  weekly: number[];
  color?: string;
}) {
  if (!weekly || weekly.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Commit activity is still being computed by GitHub — check back soon.
      </div>
    );
  }

  const recent = weekly.slice(-26);
  const total = recent.length;
  const data: Datum[] = recent.map((commits, i) => {
    const weeksAgo = total - 1 - i;
    return {
      label: weeksAgo === 0 ? "this week" : `${weeksAgo} weeks ago`,
      commits,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
        <XAxis dataKey="label" hide />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={48}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
        />
        <Bar dataKey="commits" fill={color} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
