import { describe, expect, it } from "vitest";
import { allProjects, allSlugs, ecosystems, getEcosystem, projectCategories } from "./index";

/**
 * Importing the registry runs Zod validation on every ecosystem, so this
 * suite doubles as the `data:validate` check — a malformed data file makes
 * the import throw and the test fail.
 */
describe("ecosystem registry", () => {
  it("loads all curated ecosystems", () => {
    expect(ecosystems.length).toBeGreaterThanOrEqual(10);
  });

  it("has a unique, kebab-case slug per ecosystem matching the lookup", () => {
    const seen = new Set<string>();
    for (const e of ecosystems) {
      expect(e.slug).toMatch(/^[a-z0-9-]+$/);
      expect(seen.has(e.slug)).toBe(false);
      seen.add(e.slug);
      expect(getEcosystem(e.slug)?.name).toBe(e.name);
    }
    expect(new Set(allSlugs).size).toBe(allSlugs.length);
  });

  it("gives every ecosystem at least one curated repo", () => {
    for (const e of ecosystems) {
      expect(e.repos.length).toBeGreaterThanOrEqual(1);
      for (const r of e.repos) {
        expect(r.owner).not.toHaveLength(0);
        expect(r.repo).not.toHaveLength(0);
      }
    }
  });

  it("flattens every project into allProjects with an ecosystem back-reference", () => {
    const total = ecosystems.reduce((n, e) => n + e.projects.length, 0);
    expect(allProjects).toHaveLength(total);
    for (const p of allProjects) {
      expect(getEcosystem(p.ecosystemSlug)?.name).toBe(p.ecosystemName);
      expect(p.category).not.toHaveLength(0);
    }
    expect(projectCategories.length).toBeGreaterThan(0);
  });
});
