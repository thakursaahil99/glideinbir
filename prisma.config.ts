import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: connection info for the CLI (migrate/studio/seed) lives here,
// not in schema.prisma. Application code gets its own connection via the
// driver adapter in src/server/db/prisma.ts.
//
// Neon (via Vercel's Postgres integration) sets DATABASE_URL to a *pooled*
// (pgbouncer transaction-mode) connection — every query can land on a
// different backend connection, which breaks `prisma migrate deploy`'s
// session-level advisory lock (P1002: timed out acquiring it). Migrations
// need the direct connection Neon also provides as DATABASE_URL_UNPOOLED;
// plain local Postgres has no such split, so this falls back to
// DATABASE_URL there.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});
