import { NextResponse } from "next/server";
import { db } from "@db/index";
import { ecosystemSnapshots, type NewEcosystemSnapshot } from "@db/schema";
import { getTodaysSnapshots } from "@/lib/metrics/snapshot";

export const dynamic = "force-dynamic";

/**
 * Daily cron target (registered in vercel.json — Phase 3.5). Persists one
 * row per ecosystem for "today", reusing the exact same computation the live
 * pages render (`getTodaysSnapshots`) so a snapshot always matches what a
 * visitor saw that day. Idempotent: re-running for a date that already has
 * rows is a no-op via `onConflictDoNothing` on the (slug, date) unique index.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const snapshots = await getTodaysSnapshots();

  const rows: NewEcosystemSnapshot[] = snapshots.map((s) => ({
    slug: s.slug,
    date,
    healthScore: s.health.score,
    activity: s.health.components.activity,
    momentum: s.health.components.momentum,
    community: s.health.components.community,
    maintenance: s.health.components.maintenance,
    breadth: s.health.components.breadth,
    stars: s.metrics.stars,
    commits90d: s.metrics.commits90d,
    contributors: s.metrics.contributors,
    releasesLast90d: s.metrics.releasesLast90d,
    openIssues: s.metrics.openIssues,
    tvlUsd: s.tvl?.current,
    adoptionScore: s.adoption,
    partial: s.metrics.partial,
  }));

  const inserted = await db
    .insert(ecosystemSnapshots)
    .values(rows)
    .onConflictDoNothing({
      target: [ecosystemSnapshots.slug, ecosystemSnapshots.date],
    })
    .returning({ slug: ecosystemSnapshots.slug });

  return NextResponse.json({
    date,
    attempted: rows.length,
    inserted: inserted.length,
    skipped: rows.length - inserted.length,
  });
}
