"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Code2, Cpu, Package, ShieldCheck } from "lucide-react";
import { ecoVar } from "@/lib/colors";
import type { GraphNodeData } from "@/lib/graph-layout";

const KIND_META: Record<
  Exclude<GraphNodeData["kind"], "ecosystem">,
  { label: string; icon: typeof Code2 }
> = {
  language: { label: "Language", icon: Code2 },
  vm: { label: "VM", icon: Cpu },
  proofSystem: { label: "Proof System", icon: ShieldCheck },
  library: { label: "Library", icon: Package },
};

/** Single node renderer for every kind in the knowledge graph. Only ecosystem
 * nodes carry hue (the app's one categorical color dimension) — every other
 * kind stays neutral and is distinguished by an icon + label instead, so the
 * graph doesn't compete with the established per-ecosystem identity colors. */
export function EcoGraphNode({ data }: NodeProps) {
  const { kind, label, slug, description } = data as GraphNodeData;
  const isEcosystem = kind === "ecosystem";
  const color = isEcosystem && slug ? ecoVar(slug) : undefined;
  const meta = !isEcosystem ? KIND_META[kind] : undefined;
  const Icon = meta?.icon;

  return (
    <div
      title={description}
      className={
        isEcosystem
          ? "rounded-lg border-2 bg-card px-3 py-2 shadow-sm transition-shadow hover:shadow-md"
          : "rounded-lg border border-border bg-card/70 px-3 py-1.5 text-muted-foreground shadow-sm"
      }
      style={isEcosystem ? { borderColor: color, cursor: "pointer" } : undefined}
    >
      <Handle type="target" position={Position.Left} className="!size-1.5 !border-none !bg-border" />
      {meta ? (
        <div className="mb-0.5 flex items-center gap-1 font-data text-[9px] uppercase tracking-wide text-muted-foreground/70">
          {Icon ? <Icon className="size-2.5" /> : null}
          {meta.label}
        </div>
      ) : null}
      <div
        className={`font-data flex items-center gap-1.5 text-xs ${isEcosystem ? "font-medium" : ""}`}
        style={isEcosystem ? { color } : undefined}
      >
        {isEcosystem ? <span className="size-2 rounded-full" style={{ backgroundColor: color }} /> : null}
        {label}
      </div>
      <Handle type="source" position={Position.Right} className="!size-1.5 !border-none !bg-border" />
    </div>
  );
}
