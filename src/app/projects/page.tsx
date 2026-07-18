import type { Metadata } from "next";
import { allProjects, ecosystems, projectCategories } from "@/data";
import { ProjectExplorer } from "@/components/projects/project-explorer";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse applications, tooling, and infrastructure across the Zero-Knowledge ecosystem — filter by network and category.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ ecosystem?: string }>;
}) {
  const { ecosystem } = await searchParams;
  const ecoRefs = ecosystems.map((e) => ({ slug: e.slug, name: e.name, glyph: e.glyph }));
  const initial =
    ecosystem && ecoRefs.some((e) => e.slug === ecosystem) ? ecosystem : "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Projects
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Applications, tooling, and infrastructure being built across the ZK
        ecosystem. Filter by network or category, or search by name.
      </p>

      <div className="mt-8">
        <ProjectExplorer
          projects={allProjects}
          ecosystems={ecoRefs}
          categories={projectCategories}
          initialEcosystem={initial}
        />
      </div>
    </div>
  );
}
