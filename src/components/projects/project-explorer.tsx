"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { EnrichedProject } from "@/data";
import { ecoVar } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/projects/project-card";

interface EcoRef {
  slug: string;
  name: string;
  glyph: string;
}

export function ProjectExplorer({
  projects,
  ecosystems,
  categories,
  initialEcosystem = "all",
}: {
  projects: EnrichedProject[];
  ecosystems: EcoRef[];
  categories: string[];
  initialEcosystem?: string;
}) {
  const [ecosystem, setEcosystem] = useState<string>(initialEcosystem);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (ecosystem !== "all" && p.ecosystemSlug !== ecosystem) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q && !`${p.name} ${p.description} ${p.ecosystemName}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [projects, ecosystem, category, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50"
        />
      </div>

      {/* Ecosystem filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip label="All ecosystems" active={ecosystem === "all"} onClick={() => setEcosystem("all")} />
        {ecosystems.map((e) => (
          <FilterChip
            key={e.slug}
            label={e.name}
            glyph={e.glyph}
            color={ecoVar(e.slug)}
            active={ecosystem === e.slug}
            onClick={() => setEcosystem(e.slug)}
          />
        ))}
      </div>

      {/* Category filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip label="All types" active={category === "all"} onClick={() => setCategory("all")} small />
        {categories.map((c) => (
          <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} small />
        ))}
      </div>

      <p className="font-data mt-6 text-xs text-muted-foreground">
        {visible.length} project{visible.length === 1 ? "" : "s"}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={`${p.ecosystemSlug}-${p.name}`} project={p} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects match those filters. Try clearing the search.
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  glyph,
  color,
  active,
  onClick,
  small,
}: {
  label: string;
  glyph?: string;
  color?: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {color ? (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      ) : null}
      {glyph ? <span aria-hidden>{glyph}</span> : null}
      {label}
    </button>
  );
}
