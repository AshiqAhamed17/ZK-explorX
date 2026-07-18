"use client";

import { useMemo, useState } from "react";
import type { RankedEcosystem } from "@/lib/ecosystems";
import { CATEGORY_LABELS, type Category } from "@/data/schema";
import { cn } from "@/lib/utils";
import { EcosystemCard } from "@/components/ecosystem/ecosystem-card";

type Filter = Category | "all";

/** Client-side filterable grid of ecosystem cards. */
export function EcosystemGrid({ ranked }: { ranked: RankedEcosystem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const categories = useMemo(() => {
    const present = new Set(ranked.map((r) => r.ecosystem.category));
    return (["rollup", "zkvm", "privacy", "l1"] as Category[]).filter((c) =>
      present.has(c),
    );
  }, [ranked]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? ranked
        : ranked.filter((r) => r.ecosystem.category === filter),
    [ranked, filter],
  );

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    ...categories.map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filter === t.key
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">
              {t.key === "all"
                ? ranked.length
                : ranked.filter((r) => r.ecosystem.category === t.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <EcosystemCard key={r.ecosystem.slug} ranked={r} />
        ))}
      </div>
    </div>
  );
}
