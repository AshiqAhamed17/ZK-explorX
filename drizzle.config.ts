import { defineConfig } from "drizzle-kit";

// drizzle-kit's CLI doesn't load .env.local (Next.js's convention) on its
// own — load it explicitly rather than assume.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist in CI; DATABASE_URL is expected to come from
  // the environment there instead.
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run drizzle-kit (see .env.local)");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
