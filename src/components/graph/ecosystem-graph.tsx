"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Background, Controls, ReactFlow, type NodeMouseHandler, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ecosystemGraph } from "@/data/graph";
import { layoutGraph, type GraphNodeData } from "@/lib/graph-layout";
import { EcoGraphNode } from "./eco-graph-node";

const nodeTypes: NodeTypes = { ecoNode: EcoGraphNode };

/** Interactive knowledge graph: ecosystems and the languages, VMs, proof
 * systems, and shared libraries connecting them. Pan/zoom via React Flow's
 * built-in controls; clicking an ecosystem node navigates to its detail
 * page. */
export function EcosystemGraph() {
  const router = useRouter();
  const { nodes, edges } = useMemo(() => layoutGraph(ecosystemGraph), []);

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    const { slug } = node.data as GraphNodeData;
    if (slug) router.push(`/ecosystems/${slug}`);
  };

  return (
    <div className="h-[75vh] w-full overflow-hidden rounded-xl border border-border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
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
  );
}
