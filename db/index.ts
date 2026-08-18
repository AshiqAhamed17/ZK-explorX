import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * The `neon-http` driver is stateless HTTP — no persistent connection pool —
 * which is what makes this safe to call from Vercel's serverless functions
 * (the cron route, and any future server component reading historical rows)
 * without connection-limit issues a traditional pooled Postgres client would
 * hit under serverless concurrency.
 *
 * `db` is `undefined` when `DATABASE_URL` isn't set — a fresh clone before
 * Neon is provisioned, or CI, which doesn't need a live DB to build or run
 * the smoke tests. `drizzle()` throws synchronously on an undefined URL, and
 * since this module is imported at the top of the cron route, that used to
 * crash `next build` outright rather than failing at request time. Every
 * caller already treats a query failure as "no data yet" (`getHealthHistory`
 * returns `[]`); this just extends that same graceful degradation one level
 * further back, to "no `DATABASE_URL` at all".
 */
export const db = process.env.DATABASE_URL
  ? drizzle(process.env.DATABASE_URL, { schema })
  : undefined;
