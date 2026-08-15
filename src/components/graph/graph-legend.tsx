"use client";

import type { GraphNodeKind } from "@/data/graph";
import { ALL_KINDS, KIND_META } from "./kind-meta";

/** Legend + filter control: toggling a kind hides its nodes (and any edge
 * touching them) without re-laying-out the graph. */
export function GraphLegend({
  counts,
  visible,
  onToggle,
}: {
  counts: Record<GraphNodeKind, number>;
  visible: Set<GraphNodeKind>;
  onToggle: (kind: GraphNodeKind) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by node type">
      {ALL_KINDS.map((kind) => {
        const meta = KIND_META[kind];
        const Icon = meta.icon;
        const isVisible = visible.has(kind);
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={isVisible}
            onClick={() => onToggle(kind)}
            className={`font-data inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
              isVisible
                ? "border-border bg-card text-foreground"
                : "border-border/50 bg-transparent text-muted-foreground/50"
            }`}
          >
            <Icon className="size-3.5" />
            {meta.label}
            <span className="text-muted-foreground/70">{counts[kind] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
