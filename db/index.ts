import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * The `neon-http` driver is stateless HTTP — no persistent connection pool —
 * which is what makes this safe to call from Vercel's serverless functions
 * (the cron route, and any future server component reading historical rows)
 * without connection-limit issues a traditional pooled Postgres client would
 * hit under serverless concurrency.
 */
export const db = drizzle(process.env.DATABASE_URL!, { schema });
