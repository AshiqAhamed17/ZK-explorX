import { GitFork, Star } from "lucide-react";
import type { RepoCoreStat } from "@/lib/github";
import { formatCompact, timeAgo } from "@/lib/utils";

export function RepoCard({ repo }: { repo: RepoCoreStat }) {
  const full = `${repo.owner}/${repo.repo}`;
  return (
    <a
      href={`https://github.com/${full}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{repo.label ?? repo.repo}</span>
          {repo.primary ? (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              core
            </span>
          ) : null}
        </div>
        <div className="truncate font-mono text-xs text-muted-foreground">
          {full}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3.5" />
          {formatCompact(repo.stars)}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <GitFork className="size-3.5" />
          {formatCompact(repo.forks)}
        </span>
        <span className="hidden text-muted-foreground/70 md:inline">
          {timeAgo(repo.pushedAt)}
        </span>
      </div>
    </a>
  );
}
