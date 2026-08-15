import { describe, expect, it } from "vitest";
import { ecosystemGraph } from "@/data/graph";
import { layoutGraph } from "./graph-layout";

describe("layoutGraph", () => {
  const { nodes, edges } = layoutGraph(ecosystemGraph);

  it("produces one positioned node per graph node", () => {
    expect(nodes).toHaveLength(ecosystemGraph.nodes.length);
    for (const n of nodes) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it("preserves every edge", () => {
    expect(edges).toHaveLength(ecosystemGraph.edges.length);
  });

  it("colors edges from an ecosystem source by its identity, others neutral", () => {
    const fromStarknet = edges.find((e) => e.source === "ecosystem:starknet");
    const libToProof = edges.find((e) => e.source.startsWith("library:"));
    expect(fromStarknet?.style?.stroke).toBe("var(--eco-starknet)");
    expect(libToProof?.style?.stroke).toBe("var(--border)");
  });

  it("is deterministic for the same input", () => {
    const second = layoutGraph(ecosystemGraph);
    expect(second.nodes.map((n) => n.position)).toEqual(nodes.map((n) => n.position));
  });
});
