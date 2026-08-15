import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { EcosystemGraph, GraphNodeKind } from "@/data/graph";
import { ecoVar } from "@/lib/colors";

export interface GraphNodeData {
  kind: GraphNodeKind;
  label: string;
  slug?: string;
  description?: string;
  [key: string]: unknown;
}

const NODE_WIDTH = 168;
const NODE_HEIGHT = 44;

/**
 * Lays out the ecosystem knowledge graph left-to-right with dagre: ecosystem
 * nodes have no incoming edges so they anchor rank 0, and the hand-authored
 * language/vm/proofSystem/library taxonomies fan out in later ranks — dagre
 * resolves multi-hop nodes (e.g. a proof-system reachable both directly from
 * an ecosystem AND via a library) to whichever rank keeps all edges forward.
 *
 * Pure function of `graph` — same input always produces the same layout.
 */
export function layoutGraph(graph: EcosystemGraph): {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
} {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 16, ranksep: 140 });

  for (const n of graph.nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of graph.edges) {
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));

  const nodes: Node<GraphNodeData>[] = graph.nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: "ecoNode",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { kind: n.kind, label: n.label, slug: n.slug, description: n.description },
    };
  });

  const edges: Edge[] = graph.edges.map((e, i) => {
    const source = nodesById.get(e.source);
    const color = source?.kind === "ecosystem" && source.slug ? ecoVar(source.slug) : "var(--border)";
    return {
      id: `${e.source}=>${e.target}#${i}`,
      source: e.source,
      target: e.target,
      style: { stroke: color, strokeWidth: 1.25, opacity: 0.7 },
    };
  });

  return { nodes, edges };
}
