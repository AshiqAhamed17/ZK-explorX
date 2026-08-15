"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Background, Controls, ReactFlow, type NodeMouseHandler, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ecosystemGraph, type GraphNodeKind } from "@/data/graph";
import { layoutGraph } from "@/lib/graph-layout";
import { EcoGraphNode } from "./eco-graph-node";
import { GraphLegend } from "./graph-legend";
import { ALL_KINDS, KIND_META } from "./kind-meta";

const nodeTypes: NodeTypes = { ecoNode: EcoGraphNode };

/** Interactive knowledge graph: ecosystems and the languages, VMs, proof
 * systems, and shared libraries connecting them. Pan/zoom via React Flow's
 * built-in controls. Clicking a node focuses it — dimming everything not
 * directly connected — and clicking the background (or the same node again)
 * clears the focus. The legend doubles as a filter: toggling a kind hides
 * its nodes without re-running the layout, so positions stay stable. */
export function EcosystemGraph() {
  const { nodes: baseNodes, edges: baseEdges } = useMemo(() => layoutGraph(ecosystemGraph), []);
  const nodeKindById = useMemo(
    () => new Map(baseNodes.map((n) => [n.id, n.data.kind])),
    [baseNodes],
  );
  const counts = useMemo(() => {
    const c = Object.fromEntries(ALL_KINDS.map((k) => [k, 0])) as Record<GraphNodeKind, number>;
    for (const n of baseNodes) c[n.data.kind]++;
    return c;
  }, [baseNodes]);

  const [visibleKinds, setVisibleKinds] = useState<Set<GraphNodeKind>>(new Set(ALL_KINDS));
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const neighborIds = useMemo(() => {
    if (!focusedId) return null;
    const ids = new Set<string>([focusedId]);
    for (const e of baseEdges) {
      if (e.source === focusedId) ids.add(e.target);
      if (e.target === focusedId) ids.add(e.source);
    }
    return ids;
  }, [focusedId, baseEdges]);

  const focusedNode = focusedId ? baseNodes.find((n) => n.id === focusedId) : undefined;

  const nodes = useMemo(
    () =>
      baseNodes.map((n) => ({
        ...n,
        hidden: !visibleKinds.has(n.data.kind),
        data: { ...n.data, dimmed: neighborIds ? !neighborIds.has(n.id) : false },
      })),
    [baseNodes, visibleKinds, neighborIds],
  );

  const edges = useMemo(
    () =>
      baseEdges.map((e) => {
        const hidden = !visibleKinds.has(nodeKindById.get(e.source)!) || !visibleKinds.has(nodeKindById.get(e.target)!);
        const touchesFocus = focusedId ? e.source === focusedId || e.target === focusedId : true;
        return {
          ...e,
          hidden,
          style: { ...e.style, opacity: touchesFocus ? (e.style?.opacity ?? 0.7) : 0.05 },
        };
      }),
    [baseEdges, visibleKinds, focusedId, nodeKindById],
  );

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setFocusedId((current) => (current === node.id ? null : node.id));
  };

  const toggleKind = (kind: GraphNodeKind) => {
    setVisibleKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <GraphLegend counts={counts} visible={visibleKinds} onToggle={toggleKind} />

      <div className="relative h-[75vh] w-full overflow-hidden rounded-xl border border-border bg-card">
        {focusedNode ? (
          <div className="absolute top-3 left-3 z-10 max-w-xs rounded-lg border border-border bg-popover p-3 text-xs shadow-md">
            <div className="font-data mb-1 uppercase tracking-wide text-muted-foreground/70">
              {KIND_META[focusedNode.data.kind].label}
            </div>
            <div className="font-data mb-1 text-sm font-medium">{focusedNode.data.label}</div>
            {focusedNode.data.description ? (
              <p className="mb-2 text-muted-foreground">{focusedNode.data.description}</p>
            ) : null}
            {focusedNode.data.slug ? (
              <Link
                href={`/ecosystems/${focusedNode.data.slug}`}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                View ecosystem <ArrowRight className="size-3" />
              </Link>
            ) : null}
          </div>
        ) : null}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={() => setFocusedId(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background gap={28} color="var(--border)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
