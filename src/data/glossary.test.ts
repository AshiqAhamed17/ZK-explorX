import { describe, expect, it } from "vitest";
import { ecosystemGraph } from "./graph";
import { GLOSSARY_CATEGORIES, glossary, glossaryByCategory, getGlossaryTerm } from "./glossary";

/**
 * Importing the module runs Zod validation + the duplicate-id check on
 * every term, so this suite doubles as that validation check — a malformed
 * entry makes the import throw and the test fail.
 */
describe("glossary", () => {
  it("has a unique, kebab-case id per term", () => {
    const seen = new Set<string>();
    for (const t of glossary) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/);
      expect(seen.has(t.id)).toBe(false);
      seen.add(t.id);
    }
  });

  it("covers every category with at least one term", () => {
    for (const category of GLOSSARY_CATEGORIES) {
      expect(glossaryByCategory[category].length).toBeGreaterThan(0);
    }
  });

  it("partitions every term into exactly one category bucket", () => {
    const total = GLOSSARY_CATEGORIES.reduce((sum, c) => sum + glossaryByCategory[c].length, 0);
    expect(total).toBe(glossary.length);
  });

  it("resolves every graphNodeId to a real knowledge-graph node", () => {
    const graphIds = new Set(ecosystemGraph.nodes.map((n) => n.id));
    for (const t of glossary) {
      if (t.graphNodeId) expect(graphIds.has(t.graphNodeId)).toBe(true);
    }
  });

  it("looks up a term by id", () => {
    expect(getGlossaryTerm("stark")?.term).toBe("STARK");
    expect(getGlossaryTerm("does-not-exist")).toBeUndefined();
  });
});
