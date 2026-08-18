import { asc, eq } from "drizzle-orm";
import { db } from "@db/index";
import { ecosystemSnapshots } from "@db/schema";

export interface HealthHistoryPoint {
  date: string;
  healthScore: number;
}

/**
 * Every persisted daily snapshot for one ecosystem, oldest first — the
 * "health over time" series. Populated by the cron route
 * (`src/app/api/cron/snapshot/route.ts`), so a fresh ecosystem or a fresh
 * deploy will have few or no rows; callers should treat a short series as
 * "still collecting" rather than rendering a misleading sparse chart.
 *
 * Never throws: a DB hiccup shouldn't take down an ecosystem detail page
 * render, so failures are logged and treated the same as "no history yet".
 */
export async function getHealthHistory(slug: string): Promise<HealthHistoryPoint[]> {
  if (!db) return [];
  try {
    return await db
      .select({
        date: ecosystemSnapshots.date,
        healthScore: ecosystemSnapshots.healthScore,
      })
      .from(ecosystemSnapshots)
      .where(eq(ecosystemSnapshots.slug, slug))
      .orderBy(asc(ecosystemSnapshots.date));
  } catch (err) {
    console.error(`getHealthHistory(${slug}) failed:`, err);
    return [];
  }
}
