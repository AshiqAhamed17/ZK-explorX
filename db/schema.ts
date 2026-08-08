import { boolean, date, doublePrecision, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * One row per ecosystem per day — a point-in-time snapshot of the same
 * numbers the live site computes on demand (`src/lib/health.ts`,
 * `src/lib/ecosystems.ts`). Written once daily by the cron route
 * (`src/app/api/cron/snapshot/route.ts`, Phase 3.4) and read back to power
 * historical trend charts (Phase 3.6) — something a live-only site can't do,
 * since health/adoption scores are normalized *relative to the tracked set*
 * on the day they're computed and can't be reconstructed after the fact.
 */
export const ecosystemSnapshots = pgTable(
  "ecosystem_snapshots",
  {
    id: serial("id").primaryKey(),

    /** Matches `Ecosystem.slug` from src/data — not a DB foreign key, since
     *  curated ecosystem data lives in code, not this database. */
    slug: text("slug").notNull(),
    /** The day this snapshot represents (one row per slug per date). */
    date: date("date").notNull(),

    // --- Health score (src/lib/health.ts HealthBreakdown), 0-100 each ---
    healthScore: integer("health_score").notNull(),
    activity: integer("activity").notNull(),
    momentum: integer("momentum").notNull(),
    community: integer("community").notNull(),
    maintenance: integer("maintenance").notNull(),
    breadth: integer("breadth").notNull(),

    // --- Key GitHub metrics (src/types/metrics.ts EcosystemMetrics) ---
    stars: integer("stars").notNull(),
    commits90d: integer("commits_90d").notNull(),
    contributors: integer("contributors").notNull(),
    releasesLast90d: integer("releases_last_90d").notNull(),
    openIssues: integer("open_issues").notNull(),

    // --- Adoption / TVL (rollups only — null for zkVMs, privacy, L1s) ---
    tvlUsd: doublePrecision("tvl_usd"),
    adoptionScore: integer("adoption_score"),

    /** True if any underlying GitHub/DefiLlama call was degraded that day —
     *  lets the trend chart flag or discount a data point instead of
     *  presenting a partial read as if it were complete. */
    partial: boolean("partial").notNull().default(false),

    /** When this row was actually written (distinct from `date`, the day it
     *  represents — a cron retry the next morning still records yesterday's
     *  `date` but today's `createdAt`). */
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("ecosystem_snapshots_slug_date_idx").on(table.slug, table.date)],
);

export type EcosystemSnapshot = typeof ecosystemSnapshots.$inferSelect;
export type NewEcosystemSnapshot = typeof ecosystemSnapshots.$inferInsert;
