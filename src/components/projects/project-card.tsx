import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EnrichedProject } from "@/data";
import { ecoVar } from "@/lib/colors";
import { GitHubIcon } from "@/components/brand-icons";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({
  project,
  showEcosystem = true,
}: {
  project: EnrichedProject;
  showEcosystem?: boolean;
}) {
  const color = ecoVar(project.ecosystemSlug);
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          <span className="font-display font-medium">{project.name}</span>
        </div>
        <Badge variant="outline">{project.category}</Badge>
      </div>

      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        {showEcosystem ? (
          <Link
            href={`/ecosystems/${project.ecosystemSlug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{project.glyph}</span>
            {project.ecosystemName}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {project.github ? (
            <a
              href={`https://github.com/${project.github}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} on GitHub`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitHubIcon className="size-3.5" />
            </a>
          ) : null}
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-xs text-primary hover:underline"
            >
              Visit
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
