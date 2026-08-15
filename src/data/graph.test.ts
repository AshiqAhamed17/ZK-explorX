import { describe, expect, it } from "vitest";
import { ecosystems } from "@/data";
import { ecosystemGraph } from "./graph";

describe("ecosystemGraph", () => {
  const { nodes, edges } = ecosystemGraph;
  const nodeIds = new Set(nodes.map((n) => n.id));

  it("has no duplicate node ids", () => {
    expect(nodeIds.size).toBe(nodes.length);
  });

  it("every edge references an existing node on both ends", () => {
    for (const e of edges) {
      expect(nodeIds.has(e.source)).toBe(true);
      expect(nodeIds.has(e.target)).toBe(true);
    }
  });

  it("has one ecosystem node per curated ecosystem, linked by slug", () => {
    const ecoNodes = nodes.filter((n) => n.kind === "ecosystem");
    expect(ecoNodes).toHaveLength(ecosystems.length);
    for (const e of ecosystems) {
      expect(ecoNodes.some((n) => n.slug === e.slug)).toBe(true);
    }
  });

  it("every ecosystem has at least one language, vm, and proof-system edge", () => {
    for (const e of ecosystems) {
      const outgoing = edges.filter((edge) => edge.source === `ecosystem:${e.slug}`);
      expect(outgoing.some((edge) => edge.kind === "language")).toBe(true);
      expect(outgoing.some((edge) => edge.kind === "vm")).toBe(true);
      expect(outgoing.some((edge) => edge.kind === "proofSystem")).toBe(true);
    }
  });

  it("has no self-loops", () => {
    for (const e of edges) {
      expect(e.source).not.toBe(e.target);
    }
  });
});
